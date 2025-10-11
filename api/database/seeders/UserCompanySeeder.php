<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserCompany;
use Illuminate\Database\Seeder;

class UserCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all renter users
        $renters = User::where('role', 'renter')->get();

        $companies = [
            [
                'name' => 'Miami Luxury Rentals',
                'address' => '987 Ocean Drive, Suite 200',
                'city' => 'Miami',
                'country' => 'United States',
                'postal_code' => '33139',
                'opening_time' => '08:00:00',
                'closing_time' => '20:00:00',
                'days_open' => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            ],
            [
                'name' => 'AutoRent España',
                'address' => '147 Gran Via, Planta 3',
                'city' => 'Madrid',
                'country' => 'Spain',
                'postal_code' => '28013',
                'opening_time' => '09:00:00',
                'closing_time' => '19:00:00',
                'days_open' => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            ],
            [
                'name' => 'Dubai Luxury Cars',
                'address' => '258 Sheikh Zayed Road, Tower 1',
                'city' => 'Dubai',
                'country' => 'United Arab Emirates',
                'postal_code' => '00000',
                'opening_time' => '07:00:00',
                'closing_time' => '22:00:00',
                'days_open' => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            ],
            [
                'name' => 'Tokyo Auto Rentals',
                'address' => '369 Shibuya Crossing, Building A',
                'city' => 'Tokyo',
                'country' => 'Japan',
                'postal_code' => '150-0002',
                'opening_time' => '08:30:00',
                'closing_time' => '21:00:00',
                'days_open' => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            ],
            [
                'name' => 'Nordic Car Services',
                'address' => '741 Gamla Stan, Level 2',
                'city' => 'Stockholm',
                'country' => 'Sweden',
                'postal_code' => '111 30',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'days_open' => 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            ],
        ];

        foreach ($renters as $index => $renter) {
            if (isset($companies[$index])) {
                UserCompany::create([
                    'user_id' => $renter->id,
                    'name' => $companies[$index]['name'],
                    'address' => $companies[$index]['address'],
                    'city' => $companies[$index]['city'],
                    'country' => $companies[$index]['country'],
                    'postal_code' => $companies[$index]['postal_code'],
                    'opening_time' => $companies[$index]['opening_time'],
                    'closing_time' => $companies[$index]['closing_time'],
                    'days_open' => $companies[$index]['days_open'],
                ]);
            }
        }
    }
}
