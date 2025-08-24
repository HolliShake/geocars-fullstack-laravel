<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plans')->insert([
            [
                'name' => 'Free',
                'description' => 'Basic plan with essential features',
                'price' => 0,
                'active' => true,
            ],
            [
                'name' => 'Pro',
                'description' => 'Professional plan with advanced features',
                'price' => 10,
                'active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'Enterprise plan with full features',
                'price' => 50,
                'active' => true,
            ],
        ]);
    }
}
