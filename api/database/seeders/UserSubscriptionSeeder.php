<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Seeder;

class UserSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ROLE NOTE:
     *   role='user'   = subscriber — they pay for a plan to list cars on the platform.
     *   role='renter' = customer   — they simply rent cars; they do NOT subscribe.
     *   role='admin'  = platform admin — no subscription needed.
     *
     * Only role='user' (subscribers) receive a UserSubscription record.
     * Plan distribution for CDO car-rental subscribers:
     *   Free       (₱0 /mo)  — 20 % : new or occasional listers
     *   Pro        (₱10/mo)  — 50 % : established small fleet
     *   Enterprise (₱50/mo)  — 30 % : large fleet / multi-vehicle operators
     */
    public function run(): void
    {
        // Only subscribers get subscriptions.
        $subscribers = User::where('role', 'user')->get();

        foreach ($subscribers as $subscriber) {
            // Guard: skip if a subscription already exists (idempotent re-seeding).
            if (UserSubscription::where('user_id', $subscriber->id)->exists()) {
                continue;
            }

            UserSubscription::create([
                'user_id' => $subscriber->id,
                'plan_id' => $this->pickPlan(),
                'status'  => $this->pickStatus(),
            ]);
        }
    }

    /**
     * Pick a subscription plan for a subscriber.
     * Distribution: Free 20 % | Pro 50 % | Enterprise 30 %
     */
    private function pickPlan(): int
    {
        $rand = rand(1, 100);

        if ($rand <= 20) {
            return 1; // Free
        } elseif ($rand <= 70) {
            return 2; // Pro  (20+50 = 70)
        } else {
            return 3; // Enterprise
        }
    }

    /**
     * Pick a subscription status.
     * Most subscribers are active; a small portion is inactive.
     * Note: the user_subscriptions.status enum only allows 'active' | 'inactive'.
     */
    private function pickStatus(): string
    {
        return rand(1, 100) <= 85 ? 'active' : 'inactive';
    }
}
