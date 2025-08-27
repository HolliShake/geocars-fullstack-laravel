<?php

namespace Database\Seeders;

use App\Enum\RoleEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // User/Car Owner Requirements
        DB::table('requirements')->insert([
            [
                'name' => 'Business Permit',
                'description' => 'A valid Business Permit is required to operate the car rental business.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
            [
                'name' => 'Proof of Income',
                'description' => 'Submission of Proof of Income is required to verify financial capacity.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
            [
                'name' => 'Vehicle Registration',
                'description' => 'Provide the Official Receipt (OR) and Certificate of Registration (CR) for all rental vehicles.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
            [
                'name' => 'Comprehensive Insurance',
                'description' => 'All vehicles must have valid comprehensive insurance and third-party liability coverage.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
            [
                'name' => 'Rental Agreement Template',
                'description' => 'Submit a copy of the rental contract or waiver to be used with clients.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
            [
                'name' => 'Tax Registration (BIR Certificate)',
                'description' => 'Provide proof of tax registration (e.g., BIR Certificate) for business compliance.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::USER->value,
            ],
        ]);

        // Renter Requirements
        DB::table('requirements')->insert([
            [
                'name' => 'Driver\'s License',
                'description' => 'A valid Driver\'s License is required to rent and operate a vehicle.',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::RENTER->value,
            ],
            [
                'name' => 'Valid Government ID',
                'description' => 'Provide one government-issued ID (e.g., Passport, National ID, UMID, Voter\'s ID).',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::RENTER->value,
            ],
            [
                'name' => 'Proof of Billing Address',
                'description' => 'Submit proof of your billing address (e.g., utility bill, bank statement).',
                'is_required' => true,
                'is_active' => true,
                'role' => RoleEnum::RENTER->value,
            ]
        ]);
    }
}
