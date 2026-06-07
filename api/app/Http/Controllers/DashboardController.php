<?php

namespace App\Http\Controllers;

use App\Service\DeviceService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;
use Carbon\Carbon;
use App\Models\User;
use App\Models\UserSubscription;
use App\Models\SubscriptionTransaction;
use App\Models\CarRental;
use App\Models\UserCompany;
use App\Models\Car;
use App\Models\CarPosting;
use App\Models\Transaction;
use App\Models\Reaction;
use App\Enum\TransactionTypeEnum;
use App\Enum\RentalStatusEnum;
use Illuminate\Support\Facades\DB;

#[OA\PathItem(path: "/dashboard")]
class DashboardController extends Controller
{
    public function __construct(protected DeviceService $service) {}

    #[
        OA\Get(
            path: "/api/Dashboard/admin",
            summary: "Get admin dashboard data",
            tags: ["Dashboard"],
            description: "Retrieve admin dashboard stats and revenue history",
            operationId: "getAdminDashboard",
        ),
    ]
    #[
        OA\Response(
            response: 200,
            description: "Successful operation",
            content: new OA\JsonContent(
                ref: "#/components/schemas/AdminDashboardResponse200",
            ),
        ),
    ]
    public function adminDashboard()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // ── New Users ──────────────────────────────────────────────────────────
        $newUsersThisMonth = User::whereBetween('created_at', [$startOfMonth, $now])->count();
        $newUsersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $newUsersChange    = $this->computeChange($newUsersLastMonth, $newUsersThisMonth);

        // ── Subscription Renewals ──────────────────────────────────────────────
        $renewalsThisMonth = SubscriptionTransaction::where('type', TransactionTypeEnum::RENEWAL)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $renewalsLastMonth = SubscriptionTransaction::where('type', TransactionTypeEnum::RENEWAL)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $renewalsChange = $this->computeChange($renewalsLastMonth, $renewalsThisMonth);

        // ── Monthly Revenue ────────────────────────────────────────────────────
        $revenueThisMonth = SubscriptionTransaction::where('type', TransactionTypeEnum::PAYMENT)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->sum('amount');
        $revenueLastMonth = SubscriptionTransaction::where('type', TransactionTypeEnum::PAYMENT)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount');
        $revenueChange = $this->computeChange($revenueLastMonth, $revenueThisMonth);

        // ── Active Rentals ─────────────────────────────────────────────────────
        $activeRentalsNow       = CarRental::where('rental_status', RentalStatusEnum::CONFIRMED)->count();
        $activeRentalsLastMonth = CarRental::where('rental_status', RentalStatusEnum::CONFIRMED)
            ->whereDate('created_at', '<=', $endOfLastMonth)
            ->count();
        $activeRentalsChange = $this->computeChange($activeRentalsLastMonth, $activeRentalsNow);

        // ── Revenue History (last 12 months) ───────────────────────────────────
        $revenueHistory = SubscriptionTransaction::select(
                DB::raw("DATE_FORMAT(created_at, '%b') as month"),
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
                DB::raw('SUM(amount) as revenue')
            )
            ->where('type', TransactionTypeEnum::PAYMENT)
            ->where('created_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->groupBy('month_key', 'month')
            ->orderBy('month_key')
            ->get()
            ->map(fn($row) => [
                'month'   => $row->month,
                'revenue' => (float) $row->revenue,
            ])
            ->values();

        // ── Recent Activity (last 7 days) ──────────────────────────────────────
        $since = $now->copy()->subDays(7);

        $newUsers = User::where('created_at', '>=', $since)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'firstname', 'lastname', 'email', 'created_at'])
            ->map(fn($user) => [
                'type'        => 'new_user',
                'description' => "{$user->firstname} {$user->lastname} registered",
                'meta'        => ['email' => $user->email],
                'timestamp'   => $user->created_at->toIso8601String(),
            ]);

        $transactions = SubscriptionTransaction::with('userSubscription.user')
            ->where('created_at', '>=', $since)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($tx) => [
                'type'        => 'transaction',
                'description' => "{$tx->userSubscription->user->name} made a payment",
                'meta'        => [
                    'amount'    => (float) $tx->amount,
                    'formatted' => '$' . number_format($tx->amount, 2),
                    'type'      => $tx->type,
                ],
                'timestamp' => $tx->created_at->toIso8601String(),
            ]);

        $rentals = CarRental::with('user')
            ->where('created_at', '>=', $since)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($rental) => [
                'type'        => 'rental',
                'description' => "{$rental->user->name} booked a car rental",
                'meta'        => [
                    'days'   => $rental->days,
                    'status' => $rental->rental_status,
                    'start'  => $rental->start_date?->toDateString(),
                ],
                'timestamp' => $rental->created_at->toIso8601String(),
            ]);

        $recentActivity = $newUsers
            ->concat($transactions)
            ->concat($rentals)
            ->sortByDesc('timestamp')
            ->take(20)
            ->values();

        return [
            'stats' => [
                'newUsers' => [
                    'value'      => $newUsersThisMonth,
                    'change'     => $newUsersChange['formatted'],
                    'isPositive' => $newUsersChange['isPositive'],
                ],
                'subscriptionRenewals' => [
                    'value'      => $renewalsThisMonth,
                    'change'     => $renewalsChange['formatted'],
                    'isPositive' => $renewalsChange['isPositive'],
                ],
                'monthlyRevenue' => [
                    'value'      => (float) $revenueThisMonth,
                    'formatted'  => '$' . number_format($revenueThisMonth, 0, '.', ','),
                    'change'     => $revenueChange['formatted'],
                    'isPositive' => $revenueChange['isPositive'],
                ],
                'activeRentals' => [
                    'value'      => $activeRentalsNow,
                    'change'     => $activeRentalsChange['formatted'],
                    'isPositive' => $activeRentalsChange['isPositive'],
                ],
            ],
            'revenueHistory'  => $revenueHistory,
            'recentActivity'  => $recentActivity,
        ];
    }

    #[OA\Get(
        path: "/api/Dashboard/user",
        summary: "Get dashboard statistics for car owner",
        tags: ["Dashboard"],
        description: "Retrieve dashboard metrics for the authenticated car owner, including active bookings, total trips, total spent, average rating, and recent activity.",
        operationId: "getUserDashboard",
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "stats",
                    properties: [
                        new OA\Property(
                            property: "activeBookings",
                            properties: [
                                new OA\Property(property: "value", type: "integer", example: 2),
                                new OA\Property(property: "change", type: "string", example: "+12.0%"),
                                new OA\Property(property: "isPositive", type: "boolean", example: true),
                            ],
                            type: "object"
                        ),
                        new OA\Property(
                            property: "totalTrips",
                            properties: [
                                new OA\Property(property: "value", type: "integer", example: 12),
                                new OA\Property(property: "change", type: "string", example: "+8.0%"),
                                new OA\Property(property: "isPositive", type: "boolean", example: true),
                            ],
                            type: "object"
                        ),
                        new OA\Property(
                            property: "totalSpent",
                            properties: [
                                new OA\Property(property: "value", type: "number", format: "float", example: 2450.00),
                                new OA\Property(property: "formatted", type: "string", example: "$2,450"),
                                new OA\Property(property: "change", type: "string", example: "+10.0%"),
                                new OA\Property(property: "isPositive", type: "boolean", example: true),
                            ],
                            type: "object"
                        ),
                        new OA\Property(
                            property: "avgRating",
                            properties: [
                                new OA\Property(property: "value", type: "number", format: "float", example: 4.8, nullable: true),
                                new OA\Property(property: "change", type: "string", example: "+2.0%"),
                                new OA\Property(property: "isPositive", type: "boolean", example: true),
                            ],
                            type: "object"
                        ),
                    ],
                    type: "object"
                ),
                new OA\Property(property: "activeBookings", type: "array", items: new OA\Items(ref: "#/components/schemas/CarRental")),
                new OA\Property(
                    property: "revenueHistory",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "month", type: "string", example: "Jan"),
                            new OA\Property(property: "revenue", type: "number", format: "float", example: 1200.50),
                        ],
                        type: "object"
                    )
                ),
                new OA\Property(
                    property: "recentActivity",
                    type: "array",
                    items: new OA\Items(type: "object")
                ),
            ]
        )
    )]
    public function userDashboard(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Get all user companies for the authenticated user
        $companyIds = UserCompany::where('user_id', $user->id)->pluck('id');
        // Get all cars owned by the user's companies
        $carIds = Car::whereIn('user_company_id', $companyIds)->pluck('id');
        // Get all car postings for those cars
        $carPostingIds = CarPosting::whereIn('car_id', $carIds)->pluck('id');

        // Active bookings (pending or confirmed) for cars owned by the user
        $activeBookings = CarRental::with(['carPosting.car'])
            ->whereIn('car_posting_id', $carPostingIds)
            ->whereIn('rental_status', [
                RentalStatusEnum::PENDING->value,
                RentalStatusEnum::CONFIRMED->value
            ])
            ->orderBy('start_date', 'asc')
            ->get();

        $activeBookingsThisMonth = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->whereIn('rental_status', [
                RentalStatusEnum::PENDING->value,
                RentalStatusEnum::CONFIRMED->value,
            ])
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $activeBookingsLastMonth = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->whereIn('rental_status', [
                RentalStatusEnum::PENDING->value,
                RentalStatusEnum::CONFIRMED->value,
            ])
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $activeBookingsChange = $this->computeChange($activeBookingsLastMonth, $activeBookingsThisMonth);

        // Total completed trips for cars owned by the user
        $totalTrips = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->where('rental_status', RentalStatusEnum::COMPLETED->value)
            ->count();
        $totalTripsThisMonth = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->where('rental_status', RentalStatusEnum::COMPLETED->value)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $totalTripsLastMonth = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->where('rental_status', RentalStatusEnum::COMPLETED->value)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $totalTripsChange = $this->computeChange($totalTripsLastMonth, $totalTripsThisMonth);

        // Total spent (sum of all transactions for these rentals)
        $rentalIds = CarRental::whereIn('car_posting_id', $carPostingIds)->pluck('id');
        $totalSpent = Transaction::whereIn('car_rental_id', $rentalIds)
            ->sum('amount');
        $totalSpentThisMonth = (float) Transaction::whereIn('car_rental_id', $rentalIds)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->sum('amount');
        $totalSpentLastMonth = (float) Transaction::whereIn('car_rental_id', $rentalIds)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount');
        $totalSpentChange = $this->computeChange($totalSpentLastMonth, $totalSpentThisMonth);

        // Revenue history (last 12 months) based on rental transactions
        $revenueHistory = Transaction::select(
                DB::raw("DATE_FORMAT(created_at, '%b') as month"),
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
                DB::raw('SUM(amount) as revenue')
            )
            ->whereIn('car_rental_id', $rentalIds)
            ->where('created_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->groupBy('month_key', 'month')
            ->orderBy('month_key')
            ->get()
            ->map(fn($row) => [
                'month' => $row->month,
                'revenue' => (float) $row->revenue,
            ])
            ->values();

        // Average rating: ratio of 'like' reactions to all reactions for these car postings
        $likeCount = 0;
        $totalReactions = 0;
        if ($carPostingIds->count() > 0) {
            $likeCount = Reaction::whereIn('car_posting_id', $carPostingIds)
                ->where('reaction', 'like')
                ->count();
            $totalReactions = Reaction::whereIn('car_posting_id', $carPostingIds)->count();
        }
        $avgRating = $totalReactions > 0 ? round($likeCount / $totalReactions * 5, 2) : null;

        $thisMonthLikeCount = Reaction::whereIn('car_posting_id', $carPostingIds)
            ->where('reaction', 'like')
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $thisMonthTotalReactions = Reaction::whereIn('car_posting_id', $carPostingIds)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $avgRatingThisMonth = $thisMonthTotalReactions > 0
            ? round($thisMonthLikeCount / $thisMonthTotalReactions * 5, 2)
            : 0;

        $lastMonthLikeCount = Reaction::whereIn('car_posting_id', $carPostingIds)
            ->where('reaction', 'like')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $lastMonthTotalReactions = Reaction::whereIn('car_posting_id', $carPostingIds)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $avgRatingLastMonth = $lastMonthTotalReactions > 0
            ? round($lastMonthLikeCount / $lastMonthTotalReactions * 5, 2)
            : 0;
        $avgRatingChange = $this->computeChange($avgRatingLastMonth, $avgRatingThisMonth);

        // Recent activity (last 7 days)
        $since = $now->copy()->subDays(7);

        $recentRentals = CarRental::with(['carPosting.car'])
            ->whereIn('car_posting_id', $carPostingIds)
            ->where('updated_at', '>=', $since)
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(fn($rental) => [
                'type' => 'rental',
                'description' => 'Rental #' . $rental->id . ' status updated',
                'meta' => [
                    'status' => $rental->rental_status,
                    'start' => $rental->start_date?->toDateString(),
                    'end' => $rental->end_date?->toDateString(),
                ],
                'timestamp' => $rental->updated_at?->toIso8601String(),
            ]);

        $recentTransactions = Transaction::whereIn('car_rental_id', $rentalIds)
            ->where('created_at', '>=', $since)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($tx) => [
                'type' => 'transaction',
                'description' => 'Payment received for rental #' . $tx->car_rental_id,
                'meta' => [
                    'amount' => (float) $tx->amount,
                    'formatted' => '$' . number_format($tx->amount, 2),
                ],
                'timestamp' => $tx->created_at?->toIso8601String(),
            ]);

        $recentActivity = $recentRentals
            ->concat($recentTransactions)
            ->sortByDesc('timestamp')
            ->take(20)
            ->values();

        return response()->json([
            'stats' => [
                'activeBookings' => [
                    'value' => $activeBookings->count(),
                    'change' => $activeBookingsChange['formatted'],
                    'isPositive' => $activeBookingsChange['isPositive'],
                ],
                'totalTrips' => [
                    'value' => $totalTrips,
                    'change' => $totalTripsChange['formatted'],
                    'isPositive' => $totalTripsChange['isPositive'],
                ],
                'totalSpent' => [
                    'value' => (float) $totalSpent,
                    'formatted' => '$' . number_format($totalSpent, 0, '.', ','),
                    'change' => $totalSpentChange['formatted'],
                    'isPositive' => $totalSpentChange['isPositive'],
                ],
                'avgRating' => [
                    'value' => $avgRating,
                    'change' => $avgRatingChange['formatted'],
                    'isPositive' => $avgRatingChange['isPositive'],
                ],
            ],
            'activeBookings' => $activeBookings,
            'revenueHistory' => $revenueHistory,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function renterDashboard()
    {

    }

    // ── Helper ─────────────────────────────────────────────────────────────────
    private function computeChange(int|float $previous, int|float $current): array
    {
        if ($previous == 0) {
            $percent    = $current > 0 ? 100.0 : 0.0;
            $isPositive = $current >= 0;
        } else {
            $percent    = (($current - $previous) / $previous) * 100;
            $isPositive = $percent >= 0;
        }

        $sign      = $isPositive ? '+' : '';
        $formatted = $sign . number_format($percent, 1) . '%';

        return compact('formatted', 'isPositive');
    }
}