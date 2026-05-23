<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Seeder;

class UserSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            // Skip admin user - they don't need subscriptions
            if ($user->role === 'admin') {
                continue;
            }

            // Skip if user already has a subscription
            if (UserSubscription::where('user_id', $user->id)->exists()) {
                continue;
            }

            // Determine subscription plan based on user role and random chance
            $planId = $this->getPlanForUser($user);
            $status = $this->getStatusForUser($user);

            UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $planId,
                'status' => $status,
            ]);
        }
    }

    /**
     * Get appropriate plan for user based on role and random distribution
     */
    private function getPlanForUser($user): int
    {
        // Renter users are more likely to have higher-tier plans
        if ($user->role === 'renter') {
            $rand = rand(1, 100);
            if ($rand <= 20) {
                return 1; // Free plan (20% chance)
            } elseif ($rand <= 70) {
                return 2; // Pro plan (50% chance)
            } else {
                return 3; // Enterprise plan (30% chance)
            }
        } else {
            // Regular users are more likely to have free or pro plans
            $rand = rand(1, 100);
            if ($rand <= 60) {
                return 1; // Free plan (60% chance)
            } elseif ($rand <= 90) {
                return 2; // Pro plan (30% chance)
            } else {
                return 3; // Enterprise plan (10% chance)
            }
        }
    }

    /**
     * Get subscription status for user
     */
    private function getStatusForUser($user): string
    {
        // Most users have active subscriptions
        $rand = rand(1, 100);
        if ($rand <= 85) {
            return 'active';
        } elseif ($rand <= 95) {
            return 'inactive';
        } else {
            return 'inactive'; // 'cancelled' is not a valid enum value
        }
    }
}
