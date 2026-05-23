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
     * Role semantics (clarified):
     *   role='user'   = SUBSCRIBER — pays for a plan, owns a UserCompany,
     *                   and lists cars for rent on the platform.
     *   role='renter' = CUSTOMER   — browses listings and books cars from
     *                   subscribers. Does NOT own a company or subscribe.
     *   role='admin'  = PLATFORM ADMIN — full access, no subscription.
     *
     * All users are based in Cagayan de Oro City (postal code 9000).
     * Phone numbers: Philippine mobile format +639XXXXXXXXX.
     *
     * Insertion order (important for CommentSeeder's index mapping):
     *   1 admin  → id 1
     *   5 users  → id 2–6   (subscribers, car-rental business owners)
     *   5 renters→ id 7–11  (customers who rent cars)
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

        // ── Subscribers (role = user) — car rental business owners ────────────
        // Each subscriber owns a UserCompany (assigned by UserCompanySeeder in
        // the same order: subscriber[0] → company[0], subscriber[1] → company[1], …).
        // Subscribers also hold a plan subscription (Free / Pro / Enterprise).
        $subscribers = [
            [
                // subscriber 0 → Kagay-an Car Rental (Barangay Divisoria)
                'firstname'   => 'Ricardo',
                'lastname'    => 'Villanueva',
                'username'    => 'ricardovillanueva',
                'phone'       => '+639171234501',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Blk 5 Lot 3, Velez Street, Barangay Divisoria',
                'postal_code' => '9000',
                'email'       => 'ricardo.villanueva@kagayan-rental.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // subscriber 1 → Golden Friendship Auto Hire (Barangay Cogon)
                'firstname'   => 'Luz',
                'lastname'    => 'Flores',
                'username'    => 'luzflores',
                'phone'       => '+639281234502',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '18 Recto Avenue, Barangay Cogon',
                'postal_code' => '9000',
                'email'       => 'luz.flores@goldenfriendship-autohire.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // subscriber 2 → Misamis Car Rentals (Barangay Lapasan)
                'firstname'   => 'Eduardo',
                'lastname'    => 'Mendoza',
                'username'    => 'eduardomendoza',
                'phone'       => '+639391234503',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Limketkai Drive, Barangay Lapasan',
                'postal_code' => '9000',
                'email'       => 'eduardo.mendoza@misamis-rental.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // subscriber 3 → XU Carpark Rentals (Barangay Nazareth)
                'firstname'   => 'Glenda',
                'lastname'    => 'Cruz',
                'username'    => 'glendacruz',
                'phone'       => '+639501234504',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Corrales Avenue, Barangay Nazareth',
                'postal_code' => '9000',
                'email'       => 'glenda.cruz@xu-carpark-rentals.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                // subscriber 4 → Limketkai Auto Lease (Barangay Macasandig)
                'firstname'   => 'Arturo',
                'lastname'    => 'Bautista',
                'username'    => 'arturobautista',
                'phone'       => '+639611234505',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Macasandig Road, Barangay Macasandig',
                'postal_code' => '9000',
                'email'       => 'arturo.bautista@limketkai-autolease.ph',
                'role'        => RoleEnum::USER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
        ];

        foreach ($subscribers as $data) {
            User::create($data);
        }

        // ── Renters (role = renter) — customers who rent cars ─────────────────
        // Renters browse listings and book cars from subscribers.
        // They submit personal documents (Driver's License, Government ID).
        // They do NOT own a company and do NOT subscribe to any plan.
        $renters = [
            [
                'firstname'   => 'Juan',
                'lastname'    => 'dela Cruz',
                'username'    => 'juandelacruz',
                'phone'       => '+639721234506',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => 'Blk 3 Lot 7, Velez Street, Barangay Divisoria',
                'postal_code' => '9000',
                'email'       => 'juan.delacruz@email.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Maria',
                'lastname'    => 'Santos',
                'username'    => 'mariasantos',
                'phone'       => '+639831234507',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '14 Recto Avenue, Barangay Cogon',
                'postal_code' => '9000',
                'email'       => 'maria.santos@email.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Jose',
                'lastname'    => 'Reyes',
                'username'    => 'josereyes',
                'phone'       => '+639941234508',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '88 Limketkai Drive, Barangay Lapasan',
                'postal_code' => '9000',
                'email'       => 'jose.reyes@email.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Ana',
                'lastname'    => 'Garcia',
                'username'    => 'anagarcia',
                'phone'       => '+639151234509',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '22 Ateneo Avenue, Barangay Nazareth',
                'postal_code' => '9000',
                'email'       => 'ana.garcia@email.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
            [
                'firstname'   => 'Pedro',
                'lastname'    => 'Ramos',
                'username'    => 'pedroramos',
                'phone'       => '+639261234510',
                'country'     => 'Philippines',
                'city'        => 'Cagayan de Oro',
                'address'     => '5 Macasandig Road, Barangay Macasandig',
                'postal_code' => '9000',
                'email'       => 'pedro.ramos@email.ph',
                'role'        => RoleEnum::RENTER->value,
                'is_active'   => true,
                'password'    => Hash::make('password123'),
            ],
        ];

        foreach ($renters as $data) {
            User::create($data);
        }
    }
}
