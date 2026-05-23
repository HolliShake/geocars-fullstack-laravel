<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserCompany;
use Illuminate\Database\Seeder;

class UserCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * All companies are located in Cagayan de Oro City, Misamis Oriental,
     * Philippines (postal code 9000). Each company is assigned to the
     * matching renter user from UserSeeder (same array order).
     *
     * Companies reference real CDO barangays and landmarks:
     *   Divisoria  — the main commercial district (city center)
     *   Cogon      — the Cogon Market / Recto Avenue commercial strip
     *   Lapasan    — the Limketkai Drive industrial-commercial corridor
     *   Nazareth   — near Xavier University / Ateneo de Cagayan corridor
     *   Macasandig — eastern residential-commercial district
     *
     * ROLE NOTE:
     *   role='user'   = subscriber who owns a company and lists cars for rent.
     *   role='renter' = customer who rents cars; they never own a company.
     */
    public function run(): void
    {
        // Subscribers (role='user') own companies — NOT renters.
        $renters = User::where('role', 'user')->get();

        $companies = [
            [
                // Renter: Ricardo Villanueva
                'name'         => 'Kagay-an Car Rental',
                'address'      => 'Blk 5 Lot 3, Velez Street, Barangay Divisoria',
                'city'         => 'Cagayan de Oro',
                'country'      => 'Philippines',
                'postal_code'  => '9000',
                'opening_time' => '07:00:00',
                'closing_time' => '19:00:00',
                'days_open'    => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            ],
            [
                // Renter: Luz Flores
                'name'         => 'Golden Friendship Auto Hire',
                'address'      => '18 Recto Avenue, Barangay Cogon',
                'city'         => 'Cagayan de Oro',
                'country'      => 'Philippines',
                'postal_code'  => '9000',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'days_open'    => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            ],
            [
                // Renter: Eduardo Mendoza
                'name'         => 'Misamis Car Rentals',
                'address'      => 'Limketkai Drive, Barangay Lapasan',
                'city'         => 'Cagayan de Oro',
                'country'      => 'Philippines',
                'postal_code'  => '9000',
                'opening_time' => '07:00:00',
                'closing_time' => '20:00:00',
                'days_open'    => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            ],
            [
                // Renter: Glenda Cruz
                'name'         => 'XU Carpark Rentals',
                'address'      => 'Corrales Avenue, Barangay Nazareth',
                'city'         => 'Cagayan de Oro',
                'country'      => 'Philippines',
                'postal_code'  => '9000',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'days_open'    => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            ],
            [
                // Renter: Arturo Bautista
                'name'         => 'Limketkai Auto Lease',
                'address'      => 'Macasandig Road, Barangay Macasandig',
                'city'         => 'Cagayan de Oro',
                'country'      => 'Philippines',
                'postal_code'  => '9000',
                'opening_time' => '08:00:00',
                'closing_time' => '20:00:00',
                'days_open'    => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            ],
        ];

        foreach ($renters as $index => $renter) {
            if (isset($companies[$index])) {
                UserCompany::create([
                    'user_id'      => $renter->id,
                    'name'         => $companies[$index]['name'],
                    'address'      => $companies[$index]['address'],
                    'city'         => $companies[$index]['city'],
                    'country'      => $companies[$index]['country'],
                    'postal_code'  => $companies[$index]['postal_code'],
                    'opening_time' => $companies[$index]['opening_time'],
                    'closing_time' => $companies[$index]['closing_time'],
                    'days_open'    => $companies[$index]['days_open'],
                ]);
            }
        }
    }
}
