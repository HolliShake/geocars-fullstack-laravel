<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plans')->insert([
            [
                'id' => 1,
                'name' => 'Free',
                'description' => 'Basic plan with essential features',
                'price' => 0,
                'active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Pro',
                'description' => 'Professional plan with advanced features',
                'price' => 10,
                'active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Enterprise',
                'description' => 'Enterprise plan with full features',
                'price' => 50,
                'active' => true,
            ],
        ]);
    }
}
