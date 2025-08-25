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
    }
}
