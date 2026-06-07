<?php

namespace Database\Seeders;

use App\Models\CarRental;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * A GPS tracking device is provisioned for every rental that is currently
     * in an active or completed state (confirmed or completed).
     * Pending, rejected, and cancelled rentals do not have devices assigned.
     *
     * Device identifiers follow the pattern:
     *   GPS-TRACKER-000001, GPS-TRACKER-000002, …
     */
    public function run(): void
    {
        $rentals = CarRental::whereIn('rental_status', ['confirmed', 'completed'])->get();
        $records = [];
        $now = now();

        foreach ($rentals as $index => $rental) {
            $records[] = [
                'device_identifier' => 'GPS-TRACKER-' . str_pad($index + 1, 6, '0', STR_PAD_LEFT),
                'car_rental_id'     => $rental->id,
                'created_at'        => $now,
                'updated_at'        => $now,
            ];
        }

        DB::table('devices')->insert($records);
    }
}
