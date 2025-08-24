<?php

namespace Database\Seeders;

use App\Enum\RequiredFeatureEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            1 => [
                RequiredFeatureEnum::CARS->value              => '3',         // only 3 cars
                RequiredFeatureEnum::DASHBOARD->value         => 'true',
                RequiredFeatureEnum::DASHBOARD_TIME->value    => '3',         // only 3 hours/day
                RequiredFeatureEnum::ANALYTICS_ENABLED->value => 'false',
                RequiredFeatureEnum::TRACKING_ENABLED->value  => 'false',
                RequiredFeatureEnum::TRACKING_HOUR->value     => '3',         // only 3 hours/day
            ],
            2 => [
                RequiredFeatureEnum::CARS->value              => '10',        // only 10 cars
                RequiredFeatureEnum::DASHBOARD->value         => 'true',
                RequiredFeatureEnum::DASHBOARD_TIME->value    => '8',         // only 8 hours/day
                RequiredFeatureEnum::ANALYTICS_ENABLED->value => 'true',
                RequiredFeatureEnum::TRACKING_ENABLED->value  => 'true',
                RequiredFeatureEnum::TRACKING_HOUR->value     => '8',         // only 8 hours/day
            ],
            3 => [
                RequiredFeatureEnum::CARS->value              => 'unlimited', // unlimited cars
                RequiredFeatureEnum::DASHBOARD->value         => 'true',
                RequiredFeatureEnum::DASHBOARD_TIME->value    => 'unlimited', // unlimited hours/day
                RequiredFeatureEnum::ANALYTICS_ENABLED->value => 'true',
                RequiredFeatureEnum::TRACKING_ENABLED->value  => 'true',
                RequiredFeatureEnum::TRACKING_HOUR->value     => 'unlimited', // unlimited hours/day
            ],
        ];

        $features = [];
        foreach ($plans as $plan_id => $featureSet) {
            foreach ($featureSet as $name => $value) {
                $features[] = [
                    'name'    => $name,
                    'value'   => $value,
                    'plan_id' => $plan_id,
                ];
            }
        }

        DB::table('plan_features')->insert($features);
    }
}
