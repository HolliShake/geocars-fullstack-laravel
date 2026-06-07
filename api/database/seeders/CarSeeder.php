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
     *
     * Each car entry is keyed to the exact PNG filename that lives in
     * storage/app/public/, so the car brand/model always matches its photo.
     *
     * Distribution (16 cars total):
     *   Kagay-an Car Rental         (Divisoria)   → 4 cars  KAG-100x
     *   Golden Friendship Auto Hire (Cogon)        → 3 cars  GFA-200x
     *   Misamis Car Rentals         (Lapasan)      → 3 cars  MCR-300x
     *   XU Carpark Rentals          (Nazareth)     → 3 cars  XUC-400x
     *   Limketkai Auto Lease        (Macasandig)   → 3 cars  LAL-500x
     *
     * Spatie Media Library (disk: 'public' → public/uploads/):
     *   - Source PNGs live in database/seeders/car-images/ — NOT in
     *     storage/app/public/ — because storage/ is often an anonymous
     *     Docker volume that shadows the bind-mount, making those files
     *     invisible inside the container. The database/ directory is always
     *     part of the bind-mount and is safe to use as a seeder asset store.
     *   - Spatie v11 replaced addMediaFromPath() with addMedia(string $path).
     *     addMedia() accepts an absolute file path string or an UploadedFile.
     *   - preservingOriginal() ensures the source PNG is never deleted.
     *   - file_exists() guard reports a clear warning instead of a silent skip.
     */
    public function run(): void
    {
        $companies = UserCompany::orderBy('id')->get();

        // ── Car catalogue ─────────────────────────────────────────────────────
        // 'image' must exactly match the filename in storage/app/public/.
        // Company index 0 → Kagay-an (4 cars), indices 1-4 → 3 cars each.
        $catalogue = [

            // ── 0: Kagay-an Car Rental — family & economy fleet ──────────────
            0 => [
                [
                    'image'           => 'toyota-corolla-2018-png-transparent-png.png',
                    'brand'           => 'Toyota',
                    'model'           => 'Corolla',
                    'plate_number'    => 'KAG-1001',
                    'color'           => 'Super White',
                    'type'            => CarTypeEnum::SEDAN->value,
                    'year'            => '2018',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '1.6L',
                    'engine_power'    => '132 HP',
                    'engine_torque'   => '160 Nm',
                    'engine_type'     => 'Dual VVT-i Inline-4',
                ],
                [
                    'image'           => 'toyota-avanza-color-dark-brown-mica-metallic-hd.png',
                    'brand'           => 'Toyota',
                    'model'           => 'Avanza',
                    'plate_number'    => 'KAG-1002',
                    'color'           => 'Dark Brown Mica Metallic',
                    'type'            => CarTypeEnum::MPV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::MANUAL->value,
                    'engine_capacity' => '1.5L',
                    'engine_power'    => '103 HP',
                    'engine_torque'   => '136 Nm',
                    'engine_type'     => 'Dual VVT-i Inline-4',
                ],
                [
                    'image'           => 'suzuki-swift-white-suzuki-cars-hd-png-download.png',
                    'brand'           => 'Suzuki',
                    'model'           => 'Swift',
                    'plate_number'    => 'KAG-1003',
                    'color'           => 'Pearl White',
                    'type'            => CarTypeEnum::HATCHBACK->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::MANUAL->value,
                    'engine_capacity' => '1.2L',
                    'engine_power'    => '82 HP',
                    'engine_torque'   => '113 Nm',
                    'engine_type'     => 'Dualjet Inline-4',
                ],
                [
                    'image'           => 'mazda3-sport-gx-2019-hd-png-download.png',
                    'brand'           => 'Mazda',
                    'model'           => '3 Sport GX',
                    'plate_number'    => 'KAG-1004',
                    'color'           => 'Soul Red Crystal',
                    'type'            => CarTypeEnum::SEDAN->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '2.0L',
                    'engine_power'    => '155 HP',
                    'engine_torque'   => '200 Nm',
                    'engine_type'     => 'SKYACTIV-G Inline-4',
                ],
            ],

            // ── 1: Golden Friendship Auto Hire — budget & compact fleet ───────
            1 => [
                [
                    'image'           => 'nissan-versa-2018-price-hd-png-download.png',
                    'brand'           => 'Nissan',
                    'model'           => 'Versa',
                    'plate_number'    => 'GFA-2001',
                    'color'           => 'Brilliant Silver',
                    'type'            => CarTypeEnum::SEDAN->value,
                    'year'            => '2018',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '1.6L',
                    'engine_power'    => '109 HP',
                    'engine_torque'   => '154 Nm',
                    'engine_type'     => 'HR16DE Inline-4',
                ],
                [
                    'image'           => 'suzuki-jimny-2019-hd-png-download.png',
                    'brand'           => 'Suzuki',
                    'model'           => 'Jimny',
                    'plate_number'    => 'GFA-2002',
                    'color'           => 'Kinetic Yellow with Black Roof',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::MANUAL->value,
                    'engine_capacity' => '1.5L',
                    'engine_power'    => '102 HP',
                    'engine_torque'   => '130 Nm',
                    'engine_type'     => 'K15B Inline-4',
                ],
                [
                    // Image filename mentions both Chevrolet and Honda CR-V;
                    // the vehicle depicted is the Honda CR-V EX 2018.
                    'image'           => 'chevrolet-transparent-png-image-honda-crv-ex-2018.png',
                    'brand'           => 'Honda',
                    'model'           => 'CR-V EX',
                    'plate_number'    => 'GFA-2003',
                    'color'           => 'Lunar Silver Metallic',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2018',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '1.5L',
                    'engine_power'    => '190 HP',
                    'engine_torque'   => '243 Nm',
                    'engine_type'     => 'VTEC Turbocharged Inline-4',
                ],
            ],

            // ── 2: Misamis Car Rentals — pickup truck fleet ───────────────────
            2 => [
                [
                    'image'           => '2017-ford-f-150-xl-ford.png',
                    'brand'           => 'Ford',
                    'model'           => 'F-150 XL',
                    'plate_number'    => 'MCR-3001',
                    'color'           => 'Oxford White',
                    'type'            => CarTypeEnum::OTHER->value,
                    'year'            => '2017',
                    'fuel_type'       => FuelTypeEnum::DIESEL->value,
                    'transmission'    => TransmissionTypeEnum::MANUAL->value,
                    'engine_capacity' => '2.7L',
                    'engine_power'    => '325 HP',
                    'engine_torque'   => '542 Nm',
                    'engine_type'     => 'EcoBoost V6 Turbo',
                ],
                [
                    'image'           => 'ford-f-150-black-ford-pick-up.png',
                    'brand'           => 'Ford',
                    'model'           => 'F-150 Lariat',
                    'plate_number'    => 'MCR-3002',
                    'color'           => 'Agate Black',
                    'type'            => CarTypeEnum::OTHER->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::DIESEL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '3.5L',
                    'engine_power'    => '375 HP',
                    'engine_torque'   => '678 Nm',
                    'engine_type'     => 'PowerBoost V6 Hybrid',
                ],
                [
                    'image'           => 'ford-f-150-raptor-black-ford.png',
                    'brand'           => 'Ford',
                    'model'           => 'F-150 Raptor',
                    'plate_number'    => 'MCR-3003',
                    'color'           => 'Shadow Black',
                    'type'            => CarTypeEnum::OTHER->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '3.5L',
                    'engine_power'    => '450 HP',
                    'engine_torque'   => '691 Nm',
                    'engine_type'     => 'EcoBoost V6 Twin Turbo',
                ],
            ],

            // ── 3: XU Carpark Rentals — premium SUV fleet ────────────────────
            3 => [
                [
                    'image'           => 'land-cruiser-2019-png-transparent-png.png',
                    'brand'           => 'Toyota',
                    'model'           => 'Land Cruiser',
                    'plate_number'    => 'XUC-4001',
                    'color'           => 'White Pearl Crystal Shine',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::DIESEL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '4.5L',
                    'engine_power'    => '232 HP',
                    'engine_torque'   => '650 Nm',
                    'engine_type'     => '1VD-FTV V8 Twin Turbo Diesel',
                ],
                [
                    'image'           => 'toyota-rav4-gx-2019-hd-png-download.png',
                    'brand'           => 'Toyota',
                    'model'           => 'RAV4 GX',
                    'plate_number'    => 'XUC-4002',
                    'color'           => 'Super White',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '2.5L',
                    'engine_power'    => '203 HP',
                    'engine_torque'   => '243 Nm',
                    'engine_type'     => 'Dynamic Force Inline-4',
                ],
                [
                    // Image filename combines Subaru Ascent and Honda Ridgeline;
                    // the primary vehicle depicted is the Subaru Ascent Premium.
                    'image'           => 'subaru-ascent-premium-honda-ridgeline-sport.png',
                    'brand'           => 'Subaru',
                    'model'           => 'Ascent Premium',
                    'plate_number'    => 'XUC-4003',
                    'color'           => 'Ice Silver Metallic',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '2.4L',
                    'engine_power'    => '260 HP',
                    'engine_torque'   => '376 Nm',
                    'engine_type'     => 'FA24F Turbocharged Boxer-4',
                ],
            ],

            // ── 4: Limketkai Auto Lease — truck & crossover fleet ─────────────
            4 => [
                [
                    'image'           => 'hilux-sr5-toyota-hilux-2019-roller-shutters-ebay.png',
                    'brand'           => 'Toyota',
                    'model'           => 'Hilux SR5',
                    'plate_number'    => 'LAL-5001',
                    'color'           => 'Silver Sky Metallic',
                    'type'            => CarTypeEnum::OTHER->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::DIESEL->value,
                    'transmission'    => TransmissionTypeEnum::MANUAL->value,
                    'engine_capacity' => '2.4L',
                    'engine_power'    => '150 HP',
                    'engine_torque'   => '400 Nm',
                    'engine_type'     => '2GD-FTV Inline-4 Turbo Diesel',
                ],
                [
                    // Image filename combines Honda Ridgeline and Nissan Rogue;
                    // the primary vehicle depicted is the Honda Ridgeline RTL.
                    'image'           => 'honda-ridgeline-rtl-nissan-rogue-2019.png',
                    'brand'           => 'Honda',
                    'model'           => 'Ridgeline RTL',
                    'plate_number'    => 'LAL-5002',
                    'color'           => 'Sonic Gray Pearl',
                    'type'            => CarTypeEnum::OTHER->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '3.5L',
                    'engine_power'    => '280 HP',
                    'engine_torque'   => '355 Nm',
                    'engine_type'     => 'i-VTEC V6',
                ],
                [
                    'image'           => 'nissan-rogue-sport-nissan-rogue-sport-2019.png',
                    'brand'           => 'Nissan',
                    'model'           => 'Rogue Sport',
                    'plate_number'    => 'LAL-5003',
                    'color'           => 'Gun Metallic',
                    'type'            => CarTypeEnum::SUV->value,
                    'year'            => '2019',
                    'fuel_type'       => FuelTypeEnum::PETROL->value,
                    'transmission'    => TransmissionTypeEnum::AUTOMATIC->value,
                    'engine_capacity' => '2.0L',
                    'engine_power'    => '141 HP',
                    'engine_torque'   => '198 Nm',
                    'engine_type'     => 'MR20DE Inline-4',
                ],
            ],

        ];

        // ── Create cars and attach images ─────────────────────────────────────
        foreach ($companies as $companyIndex => $company) {
            $companyCars = $catalogue[$companyIndex] ?? [];

            foreach ($companyCars as $entry) {
                $imageName = $entry['image'];
                unset($entry['image']); // remove before mass-assignment

                $car = Car::create(array_merge(
                    ['user_company_id' => $company->id],
                    $entry
                ));

                $this->attachImage($car, $imageName);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Attach a PNG from database/seeders/car-images/ to the 'cars' collection.
    // Using database_path() instead of storage_path() so the source files are
    // always accessible inside Docker (database/ is a standard bind-mount;
    // storage/ is frequently an anonymous volume that hides the host files).
    // -------------------------------------------------------------------------
    private function attachImage(Car $car, string $imageName): void
    {
        $imagePath = database_path('seeders/car-images/' . $imageName);

        // Guard: skip and warn if the source PNG does not exist on disk.
        if (!file_exists($imagePath)) {
            $this->command->warn(
                "[CarSeeder] Image file not found — skipping media attach: {$imageName}"
            );
            return;
        }

        // Remove any stale media that may remain from a previous seed run,
        // then copy the PNG to the Spatie 'public' disk (public/uploads/).
        $car->clearMediaCollection('cars');

        $car
            ->addMedia($imagePath)           // Spatie v11: addMediaFromPath() was replaced by addMedia(string $path)
            ->preservingOriginal()            // do NOT delete the source file
            ->usingFileName($imageName)       // keep the original filename on disk
            ->toMediaCollection('cars');      // stored → public/uploads/{id}/

        $this->command->info(
            "[CarSeeder] Attached image to {$car->brand} {$car->model} ({$car->plate_number})"
        );
    }
}
