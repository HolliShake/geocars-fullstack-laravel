<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\UserSubscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * One PAYMENT transaction is created for every user subscription:
     *  - Free plan  (id 1, price  0) → amount = 0,  reference_number = NULL
     *  - Pro plan   (id 2, price 10) → amount = 10, reference_number = 'SUB-TXN-00000001', …
     *  - Enterprise (id 3, price 50) → amount = 50, reference_number = 'SUB-TXN-00000002', …
     *
     * Free-plan subscriptions never generate a payment reference because no
     * money changes hands.
     */
    public function run(): void
    {
        $subscriptions = UserSubscription::all();
        $records = [];
        $index = 1;
        $now = now();

        foreach ($subscriptions as $subscription) {
            /** @var Plan $plan */
            $plan   = Plan::find($subscription->plan_id);
            $amount = (float) $plan->price;

            // Only paid subscriptions receive a unique reference number
            $referenceNumber = $amount > 0
                ? 'SUB-TXN-' . str_pad($index, 8, '0', STR_PAD_LEFT)
                : null;

            $records[] = [
                'user_subscription_id' => $subscription->id,
                'amount'               => round($amount, 2),
                'type'                 => 'payment',
                'reference_number'     => $referenceNumber,
                'created_at'           => $now,
                'updated_at'           => $now,
            ];

            $index++;
        }

        DB::table('subscription_transactions')->insert($records);
    }
}
