<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\CarRental;
use App\Models\Transaction;
use App\Models\Reaction;
use App\Models\UserCompany;
use App\Models\Car;
use App\Models\CarPosting;
use App\Enum\RentalStatusEnum;

#[OA\PathItem(path: "/userDashboard")]
class UserDashboardController extends Controller
{

    #[OA\Get(
        path: "/api/user/dashboard",
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
                new OA\Property(property: "active_bookings_count", type: "integer", example: 2),
                new OA\Property(property: "active_bookings", type: "array", items: new OA\Items(ref: "#/components/schemas/CarRental")),
                new OA\Property(property: "total_trips", type: "integer", example: 12),
                new OA\Property(property: "total_spent", type: "number", format: "float", example: 2450.00),
                new OA\Property(property: "avg_rating", type: "number", format: "float", example: 4.8, nullable: true),
                new OA\Property(property: "recent_activity", type: "array", items: new OA\Items(ref: "#/components/schemas/CarRental")),
            ]
        )
    )]
    public function __invoke(Request $request)
    {
        $user = $request->user();

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

        // Total completed trips for cars owned by the user
        $totalTrips = CarRental::whereIn('car_posting_id', $carPostingIds)
            ->where('rental_status', RentalStatusEnum::COMPLETED->value)
            ->count();

        // Total spent (sum of all transactions for these rentals)
        $rentalIds = CarRental::whereIn('car_posting_id', $carPostingIds)->pluck('id');
        $totalSpent = Transaction::whereIn('car_rental_id', $rentalIds)
            ->sum('amount');

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

        // Recent activity (last 5 rentals for these cars)
        $recentActivity = CarRental::with(['carPosting.car'])
            ->whereIn('car_posting_id', $carPostingIds)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'active_bookings_count' => $activeBookings->count(),
            'active_bookings' => $activeBookings,
            'total_trips' => $totalTrips,
            'total_spent' => $totalSpent,
            'avg_rating' => $avgRating,
            'recent_activity' => $recentActivity,
        ]);
    }
}
