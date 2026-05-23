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
     *
     * All users are based in Cagayan de Oro City, Misamis Oriental, Philippines.
     * Postal code 9000 is the CDO city-wide code.
     * Phone numbers follow the Philippine mobile format: +639XXXXXXXXX.
     */
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────────
        User::create([
            'firstname'   => 'Philipp Andrew',
            'lastname'    => 'Redondo',
            'username'    => 'andydevs69420',
            'phone'       => '+639123456789',
            'country'     => 'Philippines',
            'city'        => 'Cagayan de Oro',
            'address'     => 'Igpit Youngsville, Cagayan de Oro City',
            'postal_code' => '9000',
            'email'       => 'redondophilippandrewroa.dev@gmail.com',
            'role'        => RoleEnum::ADMIN->value,
            'is_active'   => true,
            'password'    => Hash::make('admin@user69420'),
        ]);

        // ── Regular users (role = user) ───────────────────────────────────────
        // These are customers who rent cars through the platform.
        $users = [
            [
                'firstname'   => 'Juan',
                'lastname'    => 'dela Cruz',
                'username'    => 'juandelacruz',
                'phone'       => '+639171234501',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Blk 3 Lot 7, Velez Street, Barangay Divisoria',
                'postal_code' => '9000',
                'email'       => 'juan.delacruz@email.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Maria',
                'lastname'    => 'Santos',
                'username'    => 'mariasantos',
                'phone'       => '+639281234502',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '14 Recto Avenue, Barangay Cogon',
                'postal_code' => '9000',
                'email'       => 'maria.santos@email.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Jose',
                'lastname'    => 'Reyes',
                'username'    => 'josereyes',
                'phone'       => '+639391234503',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '88 Limketkai Drive, Barangay Lapasan',
                'postal_code' => '9000',
                'email'       => 'jose.reyes@email.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Ana',
                'lastname'    => 'Garcia',
                'username'    => 'anagarcia',
                'phone'       => '+639501234504',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '22 Ateneo Avenue, Barangay Nazareth',
                'postal_code' => '9000',
                'email'       => 'ana.garcia@email.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Pedro',
                'lastname'    => 'Ramos',
                'username'    => 'pedroramos',
                'phone'       => '+639611234505',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '5 Macasandig Road, Barangay Macasandig',
                'postal_code' => '9000',
                'email'       => 'pedro.ramos@email.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // ── Renter users (role = renter) ──────────────────────────────────────
        // These are car rental business owners; each one will be assigned a
        // company by UserCompanySeeder in the same order listed here.
        $renters = [
            [
                // Owner of Kagay-an Car Rental (Divisoria)
                'firstname'   => 'Ricardo',
                'lastname'    => 'Villanueva',
                'username'    => 'ricardovillanueva',
                'phone'       => '+639721234506',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Blk 5 Lot 3, Velez Street, Barangay Divisoria',
                'postal_code' => '9000',
                'email'       => 'ricardo.villanueva@kagayan-rental.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // Owner of Golden Friendship Auto Hire (Cogon)
                'firstname'   => 'Luz',
                'lastname'    => 'Flores',
                'username'    => 'luzflores',
                'phone'       => '+639831234507',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '18 Recto Avenue, Barangay Cogon',
                'postal_code' => '9000',
                'email'       => 'luz.flores@goldenfriendship-autohire.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // Owner of Misamis Car Rentals (Lapasan)
                'firstname'   => 'Eduardo',
                'lastname'    => 'Mendoza',
                'username'    => 'eduardomendoza',
                'phone'       => '+639941234508',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Limketkai Drive, Barangay Lapasan',
                'postal_code' => '9000',
                'email'       => 'eduardo.mendoza@misamis-rental.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // Owner of XU Carpark Rentals (Nazareth)
                'firstname'   => 'Glenda',
                'lastname'    => 'Cruz',
                'username'    => 'glendacruz',
                'phone'       => '+639151234509',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Corrales Avenue, Barangay Nazareth',
                'postal_code' => '9000',
                'email'       => 'glenda.cruz@xu-carpark-rentals.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // Owner of Limketkai Auto Lease (Macasandig)
                'firstname'   => 'Arturo',
                'lastname'    => 'Bautista',
                'username'    => 'arturobautista',
                'phone'       => '+639261234510',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Macasandig Road, Barangay Macasandig',
                'postal_code' => '9000',
                'email'       => 'arturo.bautista@limketkai-autolease.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
        ];

        foreach ($renters as $renterData) {
            User::create($renterData);
        }
    }
}
