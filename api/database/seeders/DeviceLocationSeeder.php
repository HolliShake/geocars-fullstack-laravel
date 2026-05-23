<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceLocationSeeder extends Seeder
{
    // -------------------------------------------------------------------------
    // GPS PING INTERVAL (minutes between each logged waypoint)
    // 28 points × 2 min = ~56-minute trip per device
    // -------------------------------------------------------------------------
    private const PING_INTERVAL_MIN = 2;

    // Each successive device's trip started this many minutes earlier than
    // the previous one, so the map shows varied history depths.
    private const TRIP_OFFSET_MIN = 30;

    // First device's trip ended this many minutes ago (most recent ping)
    private const FIRST_TRIP_END_OFFSET_MIN = 10;

    /**
     * Run the database seeds.
     *
     * Produces dense, road-following GPS logs for every tracked device.
     * All coordinates are within Cagayan de Oro City, Misamis Oriental,
     * Philippines and trace real barangay roads so Leaflet Routing Machine
     * (or a plain L.Polyline) renders a clean, continuous path.
     *
     * 5 CDO routes (assigned round-robin by device index % 5):
     *
     *   0 → Kagay-an Car Rental        Divisoria → SM City CDO → Carmen
     *   1 → Golden Friendship Auto Hire Cogon Market → City Center → Bulua
     *   2 → Misamis Car Rentals        Limketkai Mall → Macasandig → Gusa
     *   3 → XU Carpark Rentals         Xavier University → Canitoan → Camaman-an
     *   4 → Limketkai Auto Lease       Macasandig → Puerto → Puntod (coast)
     *
     * Each route has 28 hand-placed waypoints (~150–300 m apart).
     * Timestamps: point[0] = trip start (oldest), point[27] = most recent ping.
     * Device 0 finished ~10 min ago; each subsequent device 30 min earlier.
     *
     * Total records: 28 waypoints × 8 devices = 224 rows in device_location.
     */
    public function run(): void
    {
        $routes = $this->cdoRoutes();
        $devices = DB::table('devices')->orderBy('id')->get();
        $records = [];

        foreach ($devices as $deviceIndex => $device) {
            $route = $routes[$deviceIndex % 5];

            // Work out when this device's trip ended, then back-calculate start.
            // Device 0 ended FIRST_TRIP_END_OFFSET_MIN ago;
            // each higher-index device ended TRIP_OFFSET_MIN earlier than the last.
            $pointCount  = count($route);
            $tripDuration = ($pointCount - 1) * self::PING_INTERVAL_MIN; // minutes
            $tripEndedAgo = self::FIRST_TRIP_END_OFFSET_MIN
                            + ($deviceIndex * self::TRIP_OFFSET_MIN);     // minutes ago
            $tripStart = now()->subMinutes($tripEndedAgo + $tripDuration);

            foreach ($route as $pointIndex => [$lat, $lng]) {
                $pingTime = $tripStart->copy()->addMinutes($pointIndex * self::PING_INTERVAL_MIN);

                $records[] = [
                    'device_id'  => $device->id,
                    'latitude'   => $lat,
                    'longitude'  => $lng,
                    'created_at' => $pingTime,
                    'updated_at' => $pingTime,
                ];
            }
        }

        DB::table('device_location')->insert($records);

        $this->command->info(sprintf(
            'DeviceLocationSeeder: inserted %d GPS pings across %d devices (%d waypoints/route).',
            count($records),
            $devices->count(),
            count($this->cdoRoutes()[0])
        ));
    }

    // =========================================================================
    // ROUTE DEFINITIONS
    // All coordinates: [latitude, longitude] in WGS 84.
    // Waypoints are hand-placed to follow real CDO roads and barangay streets.
    // =========================================================================
    private function cdoRoutes(): array
    {
        return [

            // -----------------------------------------------------------------
            // ROUTE 0 — Kagay-an Car Rental
            // Divisoria (Velez St.) ➜ Cogon ➜ SM City CDO ➜ Lapasan ➜ Carmen
            // Main artery: J.R. Borja St. east then Corrales Ave./National Hwy north
            // -----------------------------------------------------------------
            [
                [8.4809, 124.6483], // 00  Divisoria – Velez St. (trip start)
                [8.4803, 124.6491], // 01  J.R. Borja St., heading east
                [8.4797, 124.6499], // 02
                [8.4791, 124.6507], // 03
                [8.4787, 124.6515], // 04  Cogon Market vicinity
                [8.4787, 124.6524], // 05  Turning north at Corrales Ave.
                [8.4793, 124.6532], // 06
                [8.4800, 124.6537], // 07
                [8.4808, 124.6540], // 08  Corrales Ave. northbound
                [8.4818, 124.6541], // 09
                [8.4829, 124.6542], // 10
                [8.4839, 124.6543], // 11  SM City CDO area
                [8.4849, 124.6544], // 12
                [8.4859, 124.6545], // 13  Limketkai Mall / Lapasan entry
                [8.4869, 124.6546], // 14
                [8.4880, 124.6547], // 15  Lapasan proper
                [8.4892, 124.6549], // 16
                [8.4904, 124.6551], // 17
                [8.4916, 124.6553], // 18
                [8.4928, 124.6555], // 19
                [8.4940, 124.6557], // 20  Approaching Carmen
                [8.4952, 124.6559], // 21
                [8.4964, 124.6561], // 22
                [8.4976, 124.6562], // 23
                [8.4988, 124.6563], // 24
                [8.5000, 124.6564], // 25
                [8.5020, 124.6566], // 26
                [8.5040, 124.6570], // 27  Carmen commercial area (trip end)
            ],

            // -----------------------------------------------------------------
            // ROUTE 1 — Golden Friendship Auto Hire
            // Cogon Market ➜ City Center ➜ J.R. Borja St. west ➜ Bulua
            // This route heads westward through the older city streets to Bulua.
            // -----------------------------------------------------------------
            [
                [8.4787, 124.6475], // 00  Cogon Market, Recto Ave. (trip start)
                [8.4786, 124.6463], // 01  Moving west along C.M. Recto Ave.
                [8.4785, 124.6451], // 02
                [8.4784, 124.6439], // 03
                [8.4783, 124.6427], // 04
                [8.4782, 124.6415], // 05  Near Osmena St. intersection
                [8.4780, 124.6403], // 06
                [8.4778, 124.6391], // 07  City center – Tiano Brothers St.
                [8.4776, 124.6379], // 08
                [8.4774, 124.6368], // 09
                [8.4771, 124.6357], // 10
                [8.4769, 124.6346], // 11
                [8.4766, 124.6335], // 12
                [8.4763, 124.6324], // 13
                [8.4760, 124.6313], // 14  Turning into Bulua corridor
                [8.4757, 124.6302], // 15
                [8.4753, 124.6291], // 16
                [8.4750, 124.6280], // 17
                [8.4747, 124.6270], // 18
                [8.4744, 124.6260], // 19  Bulua begins
                [8.4740, 124.6250], // 20
                [8.4736, 124.6240], // 21
                [8.4731, 124.6230], // 22
                [8.4726, 124.6221], // 23
                [8.4720, 124.6213], // 24
                [8.4714, 124.6205], // 25
                [8.4702, 124.6191], // 26
                [8.4686, 124.6142], // 27  Bulua commercial center (trip end)
            ],

            // -----------------------------------------------------------------
            // ROUTE 2 — Misamis Car Rentals
            // Limketkai Mall ➜ Macasandig ➜ Gusa Road (eastbound)
            // Follows the highway that continues past Macasandig toward Gusa.
            // -----------------------------------------------------------------
            [
                [8.4869, 124.6544], // 00  Limketkai Mall, Lapasan (trip start)
                [8.4872, 124.6558], // 01  Moving east on C.M. Recto / Gusa Rd.
                [8.4874, 124.6572], // 02
                [8.4876, 124.6586], // 03
                [8.4878, 124.6600], // 04
                [8.4879, 124.6614], // 05
                [8.4880, 124.6628], // 06  Entering Macasandig area
                [8.4880, 124.6642], // 07
                [8.4880, 124.6656], // 08
                [8.4880, 124.6670], // 09  Macasandig proper
                [8.4880, 124.6684], // 10
                [8.4881, 124.6698], // 11
                [8.4882, 124.6712], // 12
                [8.4884, 124.6726], // 13
                [8.4887, 124.6740], // 14  Heading toward Gusa
                [8.4890, 124.6754], // 15
                [8.4894, 124.6767], // 16
                [8.4898, 124.6780], // 17
                [8.4903, 124.6793], // 18
                [8.4908, 124.6806], // 19
                [8.4914, 124.6818], // 20  Gusa entry
                [8.4920, 124.6830], // 21
                [8.4927, 124.6840], // 22
                [8.4934, 124.6850], // 23
                [8.4942, 124.6859], // 24
                [8.4950, 124.6867], // 25
                [8.4959, 124.6875], // 26
                [8.4967, 124.6882], // 27  Gusa barangay road (trip end)
            ],

            // -----------------------------------------------------------------
            // ROUTE 3 — XU Carpark Rentals
            // Xavier University (Nazareth) ➜ south-east ➜ Canitoan ➜ Camaman-an
            // Follows Corrales Ave. south then turns east toward Camaman-an.
            // -----------------------------------------------------------------
            [
                [8.4556, 124.6386], // 00  Xavier University, Nazareth (trip start)
                [8.4560, 124.6399], // 01  Moving east along Ateneo Ave.
                [8.4563, 124.6412], // 02
                [8.4566, 124.6424], // 03
                [8.4568, 124.6436], // 04
                [8.4570, 124.6448], // 05
                [8.4572, 124.6460], // 06  Near Corrales Ave. south stretch
                [8.4573, 124.6472], // 07
                [8.4574, 124.6484], // 08
                [8.4575, 124.6496], // 09
                [8.4575, 124.6508], // 10  Heading south-east toward Canitoan
                [8.4574, 124.6520], // 11
                [8.4573, 124.6531], // 12
                [8.4572, 124.6542], // 13
                [8.4570, 124.6553], // 14  Canitoan area
                [8.4568, 124.6563], // 15
                [8.4566, 124.6573], // 16
                [8.4563, 124.6582], // 17
                [8.4560, 124.6591], // 18
                [8.4557, 124.6600], // 19
                [8.4554, 124.6609], // 20
                [8.4550, 124.6617], // 21  Camaman-an boundary
                [8.4546, 124.6625], // 22
                [8.4541, 124.6632], // 23
                [8.4536, 124.6639], // 24
                [8.4531, 124.6647], // 25
                [8.4527, 124.6656], // 26
                [8.4524, 124.6673], // 27  Camaman-an barangay center (trip end)
            ],

            // -----------------------------------------------------------------
            // ROUTE 4 — Limketkai Auto Lease
            // Macasandig ➜ Puerto ➜ Puntod (northward along the bay coast)
            // Follows the coastal access road toward Puntod and Macajalar Bay.
            // -----------------------------------------------------------------
            [
                [8.4756, 124.6680], // 00  Macasandig Rd. start (trip start)
                [8.4769, 124.6683], // 01  Moving north
                [8.4782, 124.6686], // 02
                [8.4795, 124.6689], // 03
                [8.4808, 124.6692], // 04
                [8.4821, 124.6695], // 05
                [8.4834, 124.6697], // 06  Nearing Puerto
                [8.4847, 124.6699], // 07
                [8.4860, 124.6701], // 08
                [8.4873, 124.6703], // 09  Puerto barangay
                [8.4886, 124.6705], // 10
                [8.4899, 124.6707], // 11
                [8.4912, 124.6709], // 12
                [8.4925, 124.6711], // 13
                [8.4938, 124.6713], // 14
                [8.4951, 124.6715], // 15  Continuing north toward coast
                [8.4964, 124.6717], // 16
                [8.4977, 124.6719], // 17
                [8.4990, 124.6720], // 18
                [8.5003, 124.6722], // 19
                [8.5016, 124.6724], // 20
                [8.5029, 124.6726], // 21  Puntod area
                [8.5042, 124.6728], // 22
                [8.5055, 124.6730], // 23
                [8.5068, 124.6731], // 24
                [8.5075, 124.6732], // 25  Approaching Macajalar Bay
                [8.5080, 124.6733], // 26
                [8.5085, 124.6734], // 27  Puntod coastline (trip end)
            ],

        ];
    }
}
