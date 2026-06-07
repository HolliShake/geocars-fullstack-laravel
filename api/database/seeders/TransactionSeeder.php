<?php

namespace Database\Seeders;

use App\Models\CarPosting;
use App\Models\CarRental;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Transaction rules:
     *  - completed  → PAYMENT  : deposit + (days × posting_price × 0.70)
     *  - confirmed  → PAYMENT  : deposit amount only (remaining balance due on return)
     *  - cancelled  → REFUND   : deposit amount returned to renter
     *  - pending / rejected → skipped (no financial transaction yet)
     *
     * Reference numbers are only generated for 'online' payment_method rentals;
     * cash rentals leave reference_number as NULL (MySQL allows multiple NULLs
     * on a UNIQUE column, so this is safe).
     */
    public function run(): void
    {
        $rentals = CarRental::all();
        $records = [];
        $txnIndex = 1;
        $now = now();

        foreach ($rentals as $rental) {
            $status = $rental->rental_status;

            // Pending and rejected rentals have no financial transaction yet
            if (in_array($status, ['pending', 'rejected'])) {
                continue;
            }

            /** @var CarPosting $posting */
            $posting = CarPosting::find($rental->car_posting_id);

            if ($status === 'completed') {
                // Full remaining payment: deposit already collected + 70% of
                // the total rental cost (the remaining balance after the deposit)
                $amount = round($rental->deposit + ($rental->days * (float) $posting->price * 0.70), 2);
                $type   = 'payment';
            } elseif ($status === 'confirmed') {
                // Only the upfront deposit has been collected at this point
                $amount = round((float) $rental->deposit, 2);
                $type   = 'payment';
            } elseif ($status === 'cancelled') {
                // The deposit is refunded when a rental is cancelled
                $amount = round((float) $rental->deposit, 2);
                $type   = 'refund';
            } else {
                continue;
            }

            // Online payments receive a unique reference number;
            // cash payments leave the field NULL
            $referenceNumber = $rental->payment_method === 'online'
                ? 'TXN-' . str_pad($txnIndex, 8, '0', STR_PAD_LEFT)
                : null;

            $records[] = [
                'car_rental_id'    => $rental->id,
                'amount'           => $amount,
                'type'             => $type,
                'reference_number' => $referenceNumber,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];

            $txnIndex++;
        }

        DB::table('transactions')->insert($records);
    }
}
