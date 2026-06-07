<?php

namespace Database\Seeders;

use App\Models\CarPosting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CarRentalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Inserts 15 car rentals that cover every rental_status value so the
     * application has realistic seed data across all business states:
     *
     *   3  × pending   — user just booked, future start dates
     *   3  × confirmed — renter approved, near-future start dates
     *   5  × completed — past rentals with return_date set
     *        • 2 returned on time  (return_date = start_date + days)
     *        • 2 returned early    (return_date = start_date + days - 1)
     *        • 1 returned late     (return_date = start_date + days + 2)
     *   2  × cancelled — past dates, no return_date
     *   2  × rejected  — past dates, no return_date
     *
     * ROLE NOTE:
     *   role='renter' = customer who books a car  ← these are the $users below
     *   role='user'   = subscriber who OWNS the car (they never rent from themselves)
     *
     * Renter cycling: renter[index % 5]
     *   renter[0] → rentals 0, 5, 10
     *   renter[1] → rentals 1, 6, 11
     *   renter[2] → rentals 2, 7, 12
     *   renter[3] → rentals 3, 8, 13
     *   renter[4] → rentals 4, 9, 14
     *
     * Deposit formula: price × days × 0.30 (30 % deposit)
     *
     * DB::table()->insert() is used deliberately to bypass the CarRental
     * model's restricted $fillable list (rental_status, return_date,
     * payment_method, and payment_reference are currently commented out).
     */
    public function run(): void
    {
        $postings = CarPosting::take(15)->get();
        // Customers (role='renter') are the ones who book/rent cars.
        $users    = User::where('role', 'renter')->take(5)->get();

        if ($postings->count() < 15 || $users->count() < 5) {
            $this->command->warn(
                'CarRentalSeeder requires at least 15 car postings and 5 users ' .
                'with role="renter". Skipping.'
            );
            return;
        }

        $now     = Carbon::now();
        $rentals = [];

        // ── Inline helper — builds one row for DB::table()->insert() ─────────
        $makeRow = function (
            int     $index,
            string  $status,
            int     $days,
            Carbon  $startDate,
            ?Carbon $returnDate,
            string  $paymentMethod
        ) use ($postings, $users, $now): array {
            $posting = $postings[$index];
            $user    = $users[$index % 5];
            $deposit = round($posting->price * $days * 0.30, 2);

            return [
                'car_posting_id'    => $posting->id,
                'user_id'           => $user->id,
                'days'              => $days,
                'deposit'           => $deposit,
                'start_date'        => $startDate->toDateTimeString(),
                'return_date'       => $returnDate?->toDateTimeString(),
                'rental_status'     => $status,
                'payment_method'    => $paymentMethod,
                'payment_reference' => $paymentMethod === 'online'
                                           ? (string) Str::uuid()
                                           : null,
                'created_at'        => $now->toDateTimeString(),
                'updated_at'        => $now->toDateTimeString(),
            ];
        };

        // ── 3 × PENDING ──────────────────────────────────────────────────────
        // Users just booked; start dates are well in the future.
        $rentals[] = $makeRow(0, 'pending', 3, $now->copy()->addDays(7),  null, 'cash');
        $rentals[] = $makeRow(1, 'pending', 5, $now->copy()->addDays(10), null, 'online');
        $rentals[] = $makeRow(2, 'pending', 2, $now->copy()->addDays(14), null, 'cash');

        // ── 3 × CONFIRMED ────────────────────────────────────────────────────
        // Renter approved; start dates are just around the corner.
        $rentals[] = $makeRow(3, 'confirmed', 4, $now->copy()->addDays(2), null, 'online');
        $rentals[] = $makeRow(4, 'confirmed', 7, $now->copy()->addDays(3), null, 'cash');
        $rentals[] = $makeRow(5, 'confirmed', 3, $now->copy()->addDays(5), null, 'online');

        // ── 5 × COMPLETED ────────────────────────────────────────────────────

        // [6] Returned ON TIME — return_date == start_date + days
        $start6  = $now->copy()->subDays(15);
        $days6   = 3;
        $rentals[] = $makeRow(
            6, 'completed', $days6,
            $start6,
            $start6->copy()->addDays($days6),   // exact scheduled return
            'cash'
        );

        // [7] Returned ON TIME — return_date == start_date + days
        $start7  = $now->copy()->subDays(20);
        $days7   = 5;
        $rentals[] = $makeRow(
            7, 'completed', $days7,
            $start7,
            $start7->copy()->addDays($days7),   // exact scheduled return
            'online'
        );

        // [8] Returned EARLY — return_date == start_date + days - 1
        $start8  = $now->copy()->subDays(12);
        $days8   = 4;
        $rentals[] = $makeRow(
            8, 'completed', $days8,
            $start8,
            $start8->copy()->addDays($days8 - 1),   // 1 day early
            'cash'
        );

        // [9] Returned EARLY — return_date == start_date + days - 1
        $start9  = $now->copy()->subDays(25);
        $days9   = 7;
        $rentals[] = $makeRow(
            9, 'completed', $days9,
            $start9,
            $start9->copy()->addDays($days9 - 1),   // 1 day early
            'online'
        );

        // [10] Returned LATE — return_date == start_date + days + 2
        $start10 = $now->copy()->subDays(18);
        $days10  = 3;
        $rentals[] = $makeRow(
            10, 'completed', $days10,
            $start10,
            $start10->copy()->addDays($days10 + 2),  // 2 days late
            'cash'
        );

        // ── 2 × CANCELLED ────────────────────────────────────────────────────
        // Booking was cancelled before the trip began; no return date.
        $rentals[] = $makeRow(11, 'cancelled', 3, $now->copy()->subDays(5), null, 'online');
        $rentals[] = $makeRow(12, 'cancelled', 2, $now->copy()->subDays(8), null, 'cash');

        // ── 2 × REJECTED ─────────────────────────────────────────────────────
        // Renter declined the booking request; no return date.
        $rentals[] = $makeRow(13, 'rejected', 4, $now->copy()->subDays(3), null, 'online');
        $rentals[] = $makeRow(14, 'rejected', 3, $now->copy()->subDays(6), null, 'cash');

        // ── Bulk-insert, bypassing $fillable ─────────────────────────────────
        DB::table('car_rentals')->insert($rentals);
    }
}
