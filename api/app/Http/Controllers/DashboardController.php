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
            tags: ["Admin"],
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

    public function userDashboard()
    {

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