<?php

namespace Database\Seeders;

use App\Enum\RoleEnum;
use App\Models\Requirement;
use App\Models\User;
use App\Models\UserRequirement;
use Illuminate\Database\Seeder;

class UserRequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Links every non-admin user to every requirement that matches their role:
     *
     *   role='user'   users (5)  ← 6 business-document requirements  = 30 rows
     *   role='renter' users (5)  ← 3 personal-document requirements  = 15 rows
     *   ──────────────────────────────────────────────────────────────────────
     *   Total                                                          45 rows
     *
     * Requirements are defined in RequirementSeeder:
     *   role='user'   → Business Permit, Proof of Income, Vehicle Registration,
     *                    Comprehensive Insurance, Rental Agreement Template,
     *                    Tax Registration (BIR Certificate)
     *   role='renter' → Driver's License, Valid Government ID,
     *                    Proof of Billing Address
     */
    public function run(): void
    {
        // ── Requirements by role ──────────────────────────────────────────────
        $userRoleRequirements   = Requirement::where('role', RoleEnum::USER->value)->get();
        $renterRoleRequirements = Requirement::where('role', RoleEnum::RENTER->value)->get();

        // ── Users by role (admin is intentionally excluded) ───────────────────
        $usersWithRoleUser   = User::where('role', RoleEnum::USER->value)->orderBy('id')->get();
        $usersWithRoleRenter = User::where('role', RoleEnum::RENTER->value)->orderBy('id')->get();

        // Link each role='user' user to all 6 role='user' requirements
        foreach ($usersWithRoleUser as $user) {
            foreach ($userRoleRequirements as $requirement) {
                UserRequirement::create([
                    'user_id'        => $user->id,
                    'requirement_id' => $requirement->id,
                ]);
            }
        }

        // Link each role='renter' user to all 3 role='renter' requirements
        foreach ($usersWithRoleRenter as $user) {
            foreach ($renterRoleRequirements as $requirement) {
                UserRequirement::create([
                    'user_id'        => $user->id,
                    'requirement_id' => $requirement->id,
                ]);
            }
        }

        $totalUserLinks   = $usersWithRoleUser->count()   * $userRoleRequirements->count();
        $totalRenterLinks = $usersWithRoleRenter->count() * $renterRoleRequirements->count();

        $this->command->info(
            sprintf(
                'UserRequirementSeeder: seeded %d user-requirement links (%d user + %d renter).',
                $totalUserLinks + $totalRenterLinks,
                $totalUserLinks,
                $totalRenterLinks
            )
        );
    }
}
