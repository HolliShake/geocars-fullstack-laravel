<?php

namespace Database\Seeders;

use App\Enum\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        $admin = User::create([
            'firstname' => 'Philipp Andrew',
            'lastname' => 'Redondo',
            'username' => 'andydevs69420',
            'phone' => '+639123456789',
            'country' => 'Philippines',
            'city' => 'Manila',
            'address' => 'Igpit Youngsville CDOC, Philippines',
            'postal_code' => '12345',
            'email' => 'redondophilippandrewroa.dev@gmail.com',
            'role' => RoleEnum::ADMIN->value,
            'is_active' => true,
            'password' => Hash::make('admin@user69420'),
        ]);

        // Regular users
        $users = [
            [
                'firstname' => 'John',
                'lastname' => 'Doe',
                'username' => 'johndoe',
                'phone' => '+1234567890',
                'country' => 'United States',
                'city' => 'New York',
                'address' => '123 Main Street',
                'postal_code' => '10001',
                'email' => 'john.doe@example.com',
                'role' => RoleEnum::USER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Jane',
                'lastname' => 'Smith',
                'username' => 'janesmith',
                'phone' => '+1234567891',
                'country' => 'United States',
                'city' => 'Los Angeles',
                'address' => '456 Oak Avenue',
                'postal_code' => '90210',
                'email' => 'jane.smith@example.com',
                'role' => RoleEnum::USER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Michael',
                'lastname' => 'Johnson',
                'username' => 'mikejohnson',
                'phone' => '+1234567892',
                'country' => 'Canada',
                'city' => 'Toronto',
                'address' => '789 Pine Street',
                'postal_code' => 'M5V 3A8',
                'email' => 'michael.johnson@example.com',
                'role' => RoleEnum::USER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Sarah',
                'lastname' => 'Wilson',
                'username' => 'sarahwilson',
                'phone' => '+1234567893',
                'country' => 'United Kingdom',
                'city' => 'London',
                'address' => '321 Baker Street',
                'postal_code' => 'NW1 6XE',
                'email' => 'sarah.wilson@example.com',
                'role' => RoleEnum::USER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'David',
                'lastname' => 'Brown',
                'username' => 'davidbrown',
                'phone' => '+1234567894',
                'country' => 'Australia',
                'city' => 'Sydney',
                'address' => '654 George Street',
                'postal_code' => '2000',
                'email' => 'david.brown@example.com',
                'role' => RoleEnum::USER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Renter users (car rental companies)
        $renters = [
            [
                'firstname' => 'Robert',
                'lastname' => 'Garcia',
                'username' => 'robertgarcia',
                'phone' => '+1234567895',
                'country' => 'United States',
                'city' => 'Miami',
                'address' => '987 Ocean Drive',
                'postal_code' => '33139',
                'email' => 'robert.garcia@rentacar.com',
                'role' => RoleEnum::RENTER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Maria',
                'lastname' => 'Rodriguez',
                'username' => 'mariarodriguez',
                'phone' => '+1234567896',
                'country' => 'Spain',
                'city' => 'Madrid',
                'address' => '147 Gran Via',
                'postal_code' => '28013',
                'email' => 'maria.rodriguez@autorent.com',
                'role' => RoleEnum::RENTER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Ahmed',
                'lastname' => 'Hassan',
                'username' => 'ahmedhassan',
                'phone' => '+1234567897',
                'country' => 'United Arab Emirates',
                'city' => 'Dubai',
                'address' => '258 Sheikh Zayed Road',
                'postal_code' => '00000',
                'email' => 'ahmed.hassan@luxurycars.ae',
                'role' => RoleEnum::RENTER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Yuki',
                'lastname' => 'Tanaka',
                'username' => 'yukitanaka',
                'phone' => '+1234567898',
                'country' => 'Japan',
                'city' => 'Tokyo',
                'address' => '369 Shibuya Crossing',
                'postal_code' => '150-0002',
                'email' => 'yuki.tanaka@japanrent.jp',
                'role' => RoleEnum::RENTER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'firstname' => 'Emma',
                'lastname' => 'Anderson',
                'username' => 'emmaanderson',
                'phone' => '+1234567899',
                'country' => 'Sweden',
                'city' => 'Stockholm',
                'address' => '741 Gamla Stan',
                'postal_code' => '111 30',
                'email' => 'emma.anderson@nordiccars.se',
                'role' => RoleEnum::RENTER->value,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($renters as $renterData) {
            User::create($renterData);
        }
    }
}
