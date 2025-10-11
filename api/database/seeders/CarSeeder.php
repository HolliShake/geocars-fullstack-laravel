<?php

namespace Database\Seeders;

use App\Enum\CarTypeEnum;
use App\Enum\FuelTypeEnum;
use App\Enum\TransmissionTypeEnum;
use App\Models\Car;
use App\Models\UserCompany;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = UserCompany::all();

        $cars = [
            // Miami Luxury Rentals cars
            [
                'brand' => 'BMW',
                'model' => 'X5',
                'plate_number' => 'MIA-001',
                'color' => 'Black',
                'type' => CarTypeEnum::SUV->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '3.0L',
                'engine_power' => '340 HP',
                'engine_torque' => '450 Nm',
                'engine_type' => 'Turbocharged V6',
            ],
            [
                'brand' => 'Mercedes-Benz',
                'model' => 'E-Class',
                'plate_number' => 'MIA-002',
                'color' => 'Silver',
                'type' => CarTypeEnum::SEDAN->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::HYBRID->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '2.0L',
                'engine_power' => '255 HP',
                'engine_torque' => '370 Nm',
                'engine_type' => 'Hybrid Turbo',
            ],
            [
                'brand' => 'Audi',
                'model' => 'A4',
                'plate_number' => 'MIA-003',
                'color' => 'White',
                'type' => CarTypeEnum::SEDAN->value,
                'year' => '2022',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '2.0L',
                'engine_power' => '201 HP',
                'engine_torque' => '320 Nm',
                'engine_type' => 'Turbocharged I4',
            ],

            // AutoRent España cars
            [
                'brand' => 'Volkswagen',
                'model' => 'Golf',
                'plate_number' => 'MAD-001',
                'color' => 'Blue',
                'type' => CarTypeEnum::HATCHBACK->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::DIESEL->value,
                'transmission' => TransmissionTypeEnum::MANUAL->value,
                'engine_capacity' => '2.0L',
                'engine_power' => '150 HP',
                'engine_torque' => '340 Nm',
                'engine_type' => 'Turbocharged Diesel',
            ],
            [
                'brand' => 'Seat',
                'model' => 'Leon',
                'plate_number' => 'MAD-002',
                'color' => 'Red',
                'type' => CarTypeEnum::HATCHBACK->value,
                'year' => '2022',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::MANUAL->value,
                'engine_capacity' => '1.5L',
                'engine_power' => '130 HP',
                'engine_torque' => '200 Nm',
                'engine_type' => 'Turbocharged I4',
            ],
            [
                'brand' => 'Renault',
                'model' => 'Megane',
                'plate_number' => 'MAD-003',
                'color' => 'Gray',
                'type' => CarTypeEnum::HATCHBACK->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::HYBRID->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '1.6L',
                'engine_power' => '160 HP',
                'engine_torque' => '205 Nm',
                'engine_type' => 'Hybrid E-Tech',
            ],

            // Dubai Luxury Cars
            [
                'brand' => 'Lamborghini',
                'model' => 'Huracán',
                'plate_number' => 'DXB-001',
                'color' => 'Yellow',
                'type' => CarTypeEnum::COUPE->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '5.2L',
                'engine_power' => '640 HP',
                'engine_torque' => '600 Nm',
                'engine_type' => 'V10 Natural Aspirated',
            ],
            [
                'brand' => 'Ferrari',
                'model' => '488 GTB',
                'plate_number' => 'DXB-002',
                'color' => 'Red',
                'type' => CarTypeEnum::COUPE->value,
                'year' => '2022',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '3.9L',
                'engine_power' => '670 HP',
                'engine_torque' => '760 Nm',
                'engine_type' => 'V8 Turbocharged',
            ],
            [
                'brand' => 'Bentley',
                'model' => 'Continental GT',
                'plate_number' => 'DXB-003',
                'color' => 'Black',
                'type' => CarTypeEnum::COUPE->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '6.0L',
                'engine_power' => '626 HP',
                'engine_torque' => '900 Nm',
                'engine_type' => 'W12 Twin Turbo',
            ],

            // Tokyo Auto Rentals
            [
                'brand' => 'Toyota',
                'model' => 'Prius',
                'plate_number' => 'TYO-001',
                'color' => 'White',
                'type' => CarTypeEnum::HATCHBACK->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::HYBRID->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '1.8L',
                'engine_power' => '121 HP',
                'engine_torque' => '142 Nm',
                'engine_type' => 'Hybrid Synergy Drive',
            ],
            [
                'brand' => 'Honda',
                'model' => 'Civic',
                'plate_number' => 'TYO-002',
                'color' => 'Silver',
                'type' => CarTypeEnum::SEDAN->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::PETROL->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '1.5L',
                'engine_power' => '158 HP',
                'engine_torque' => '138 Nm',
                'engine_type' => 'Turbocharged I4',
            ],
            [
                'brand' => 'Nissan',
                'model' => 'Leaf',
                'plate_number' => 'TYO-003',
                'color' => 'Blue',
                'type' => CarTypeEnum::HATCHBACK->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::ELECTRIC->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => 'N/A',
                'engine_power' => '147 HP',
                'engine_torque' => '320 Nm',
                'engine_type' => 'Electric Motor',
            ],

            // Nordic Car Services
            [
                'brand' => 'Volvo',
                'model' => 'XC90',
                'plate_number' => 'STO-001',
                'color' => 'Black',
                'type' => CarTypeEnum::SUV->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::HYBRID->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => '2.0L',
                'engine_power' => '400 HP',
                'engine_torque' => '640 Nm',
                'engine_type' => 'T8 Twin Engine',
            ],
            [
                'brand' => 'Saab',
                'model' => '9-3',
                'plate_number' => 'STO-002',
                'color' => 'Gray',
                'type' => CarTypeEnum::SEDAN->value,
                'year' => '2022',
                'fuel_type' => FuelTypeEnum::DIESEL->value,
                'transmission' => TransmissionTypeEnum::MANUAL->value,
                'engine_capacity' => '1.9L',
                'engine_power' => '120 HP',
                'engine_torque' => '280 Nm',
                'engine_type' => 'Turbocharged Diesel',
            ],
            [
                'brand' => 'Tesla',
                'model' => 'Model 3',
                'plate_number' => 'STO-003',
                'color' => 'White',
                'type' => CarTypeEnum::SEDAN->value,
                'year' => '2023',
                'fuel_type' => FuelTypeEnum::ELECTRIC->value,
                'transmission' => TransmissionTypeEnum::AUTOMATIC->value,
                'engine_capacity' => 'N/A',
                'engine_power' => '283 HP',
                'engine_torque' => '416 Nm',
                'engine_type' => 'Electric Motor',
            ],
        ];

        $carIndex = 0;
        foreach ($companies as $company) {
            // Each company gets 3 cars
            for ($i = 0; $i < 3; $i++) {
                if (isset($cars[$carIndex])) {
                    Car::create([
                        'user_company_id' => $company->id,
                        'brand' => $cars[$carIndex]['brand'],
                        'model' => $cars[$carIndex]['model'],
                        'plate_number' => $cars[$carIndex]['plate_number'],
                        'color' => $cars[$carIndex]['color'],
                        'type' => $cars[$carIndex]['type'],
                        'year' => $cars[$carIndex]['year'],
                        'fuel_type' => $cars[$carIndex]['fuel_type'],
                        'transmission' => $cars[$carIndex]['transmission'],
                        'engine_capacity' => $cars[$carIndex]['engine_capacity'],
                        'engine_power' => $cars[$carIndex]['engine_power'],
                        'engine_torque' => $cars[$carIndex]['engine_torque'],
                        'engine_type' => $cars[$carIndex]['engine_type'],
                    ]);
                    $carIndex++;
                }
            }
        }
    }
}
