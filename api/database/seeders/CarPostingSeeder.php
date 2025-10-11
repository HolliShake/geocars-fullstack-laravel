<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarPosting;
use Illuminate\Database\Seeder;

class CarPostingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cars = Car::all();

        foreach ($cars as $car) {
            // Create multiple postings for each car with different scenarios
            $postings = [
                [
                    'start_date' => now()->addDays(1),
                    'end_date' => now()->addDays(30),
                    'description' => "Premium {$car->brand} {$car->model} available for rent. Well-maintained vehicle with all modern amenities. Perfect for business trips or leisure travel.",
                    'price' => $this->getPriceForCar($car),
                    'force_enabled' => false,
                ],
                [
                    'start_date' => now()->addDays(31),
                    'end_date' => now()->addDays(60),
                    'description' => "Luxury {$car->brand} {$car->model} in excellent condition. Features include GPS navigation, climate control, and premium sound system. Ideal for special occasions.",
                    'price' => $this->getPriceForCar($car) * 1.2, // 20% higher for luxury
                    'force_enabled' => false,
                ],
                [
                    'start_date' => now()->addDays(61),
                    'end_date' => now()->addDays(90),
                    'description' => "Economical {$car->brand} {$car->model} perfect for daily commuting. Fuel-efficient and reliable. Great value for money.",
                    'price' => $this->getPriceForCar($car) * 0.8, // 20% lower for economy
                    'force_enabled' => false,
                ],
            ];

            // Add a force-enabled posting for some cars (25% chance)
            if (rand(1, 4) === 1) {
                $postings[] = [
                    'start_date' => now()->subDays(5),
                    'end_date' => now()->addDays(25),
                    'description' => "Special offer: {$car->brand} {$car->model} available immediately. This vehicle is always available for rent with priority booking.",
                    'price' => $this->getPriceForCar($car) * 1.5, // 50% higher for force-enabled
                    'force_enabled' => true,
                ];
            }

            foreach ($postings as $postingData) {
                CarPosting::create([
                    'car_id' => $car->id,
                    'start_date' => $postingData['start_date'],
                    'end_date' => $postingData['end_date'],
                    'description' => $postingData['description'],
                    'price' => $postingData['price'],
                    'force_enabled' => $postingData['force_enabled'],
                ]);
            }
        }
    }

    /**
     * Get base price for a car based on its characteristics
     */
    private function getPriceForCar($car): float
    {
        $basePrice = 50.0; // Base price per day

        // Adjust price based on brand
        $brandMultiplier = match ($car->brand) {
            'Lamborghini', 'Ferrari', 'Bentley' => 3.0,
            'BMW', 'Mercedes-Benz', 'Audi' => 2.0,
            'Volvo', 'Tesla' => 1.8,
            'Toyota', 'Honda', 'Nissan' => 1.2,
            'Volkswagen', 'Seat', 'Renault' => 1.0,
            'Saab' => 0.9,
            default => 1.0,
        };

        // Adjust price based on car type
        $typeMultiplier = match ($car->type) {
            'coupe', 'convertible' => 1.5,
            'suv' => 1.3,
            'sedan' => 1.1,
            'hatchback' => 1.0,
            'mpv' => 0.9,
            default => 1.0,
        };

        // Adjust price based on fuel type
        $fuelMultiplier = match ($car->fuel_type) {
            'electric' => 1.3,
            'hybrid' => 1.2,
            'petrol' => 1.0,
            'diesel' => 0.9,
            default => 1.0,
        };

        // Adjust price based on year (newer cars cost more)
        $yearMultiplier = 1.0;
        if ($car->year) {
            $currentYear = date('Y');
            $carYear = (int) $car->year;
            $age = $currentYear - $carYear;

            if ($age <= 1) {
                $yearMultiplier = 1.2;
            } elseif ($age <= 3) {
                $yearMultiplier = 1.1;
            } elseif ($age <= 5) {
                $yearMultiplier = 1.0;
            } else {
                $yearMultiplier = 0.8;
            }
        }

        return round($basePrice * $brandMultiplier * $typeMultiplier * $fuelMultiplier * $yearMultiplier, 2);
    }
}
