<?php

namespace Database\Seeders;

use App\Enum\RoleEnum;
use App\Models\CarPosting;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates 20 top-level comments and 15 reply comments (35 total).
     * Comments are staggered over the last ~14 days using Carbon offsets.
     *
     * ROLE NOTE:
     *   role='user'   = subscriber (car owner) — answers questions about their listings.
     *   role='renter' = customer               — asks questions and posts reviews.
     *
     * User index map (ordered by id — subscribers inserted first, renters second):
     *   0 → Ricardo Villanueva  (role=user   / subscriber — Kagay-an Car Rental)
     *   1 → Luz Flores          (role=user   / subscriber — Golden Friendship)
     *   2 → Eduardo Mendoza     (role=user   / subscriber — Misamis Car Rentals)
     *   3 → Glenda Cruz         (role=user   / subscriber — XU Carpark Rentals)
     *   4 → Arturo Bautista     (role=user   / subscriber — Limketkai Auto Lease)
     *   5 → Juan dela Cruz      (role=renter / customer)
     *   6 → Maria Santos        (role=renter / customer)
     *   7 → Jose Reyes          (role=renter / customer)
     *   8 → Ana Garcia          (role=renter / customer)
     *   9 → Pedro Ramos         (role=renter / customer)
     *
     * Semantic flow: indices 5-9 (renters) ask questions / write reviews;
     * indices 0-4 (subscribers) answer on behalf of their rental business.
     */
    public function run(): void
    {
        // All non-admin users ordered by ID (matches UserSeeder insertion order)
        $users = User::where('role', '!=', RoleEnum::ADMIN->value)
            ->orderBy('id')
            ->get();

        // Seed comments against the first 15 car postings
        $postings = CarPosting::orderBy('id')
            ->take(15)
            ->get();

        $userCount    = $users->count();    // 10
        $postingCount = $postings->count(); // 15

        // ── 20 top-level comments ─────────────────────────────────────────────
        // Each entry: posting_index, user_index, days_ago, comment text.
        // Postings/users are accessed by index into the ordered collections.
        $topLevelDefinitions = [
            [
                'posting' => 0,  'user' => 0,
                'days'    => 14,
                'text'    => 'Is this car still available for next weekend? Planning a road trip!',
            ],
            [
                'posting' => 1,  'user' => 1,
                'days'    => 13,
                'text'    => 'Great car! Rented it last month and absolutely loved the experience.',
            ],
            [
                'posting' => 2,  'user' => 2,
                'days'    => 13,
                'text'    => "What's included in the rental price? Does it cover insurance?",
            ],
            [
                'posting' => 3,  'user' => 3,
                'days'    => 12,
                'text'    => 'Can I pick it up from the city center? Which is the nearest pickup point?',
            ],
            [
                'posting' => 4,  'user' => 4,
                'days'    => 12,
                'text'    => 'Excellent condition and very clean interior! Highly recommended to everyone.',
            ],
            [
                'posting' => 5,  'user' => 5,
                'days'    => 11,
                'text'    => 'How many kilometers are allowed per day with this rental?',
            ],
            [
                'posting' => 6,  'user' => 6,
                'days'    => 11,
                'text'    => 'Does this car come with a built-in GPS navigation system?',
            ],
            [
                'posting' => 7,  'user' => 7,
                'days'    => 10,
                'text'    => 'Is airport pickup and drop-off available for this vehicle?',
            ],
            [
                'posting' => 8,  'user' => 8,
                'days'    => 10,
                'text'    => 'Amazing vehicle! The ride was incredibly smooth and very comfortable.',
            ],
            [
                'posting' => 9,  'user' => 9,
                'days'    => 9,
                'text'    => 'What is the minimum rental period for this car?',
            ],
            [
                'posting' => 10, 'user' => 0,
                'days'    => 9,
                'text'    => 'Is comprehensive insurance already included, or is it an extra charge?',
            ],
            [
                'posting' => 11, 'user' => 1,
                'days'    => 8,
                'text'    => 'Rented this last week — absolutely fantastic experience! Top-tier service.',
            ],
            [
                'posting' => 12, 'user' => 2,
                'days'    => 8,
                'text'    => 'Is a security deposit required when making a booking for this car?',
            ],
            [
                'posting' => 13, 'user' => 3,
                'days'    => 7,
                'text'    => 'Do you offer weekly or monthly discount rates for extended rentals?',
            ],
            [
                'posting' => 14, 'user' => 4,
                'days'    => 7,
                'text'    => 'Can the car be returned to a different location from where it was picked up?',
            ],
            [
                'posting' => 0,  'user' => 5,
                'days'    => 6,
                'text'    => 'Perfect choice for a family road trip — very spacious and comfortable!',
            ],
            [
                'posting' => 1,  'user' => 6,
                'days'    => 6,
                'text'    => 'What is the minimum age requirement to rent this vehicle?',
            ],
            [
                'posting' => 2,  'user' => 7,
                'days'    => 5,
                'text'    => 'Top-notch service and a pristine car — will definitely rent again soon!',
            ],
            [
                'posting' => 3,  'user' => 8,
                'days'    => 5,
                'text'    => 'Is this car pet-friendly? I will be traveling with my dog.',
            ],
            [
                'posting' => 4,  'user' => 9,
                'days'    => 4,
                'text'    => 'The listing photos look great! Is the car still in the same condition as shown?',
            ],
        ];

        // Create top-level comments and collect the Eloquent models so that
        // their IDs can be referenced when building reply comments below.
        $topLevel = [];

        foreach ($topLevelDefinitions as $def) {
            $ts = Carbon::now()->subDays($def['days']);

            // Create via Eloquent as required, then backdate to produce
            // realistic staggered timestamps in the seed data.
            $comment = Comment::create([
                'user_id'          => $users[$def['user'] % $userCount]->id,
                'car_posting_id'   => $postings[$def['posting'] % $postingCount]->id,
                'parent_comment_id' => null,
                'comment'          => $def['text'],
            ]);

            // Backdate: set Carbon timestamps, disable auto-updating, save.
            $comment->created_at = $ts;
            $comment->updated_at = $ts;
            $comment->timestamps  = false;
            $comment->save();
            $comment->timestamps  = true;

            $topLevel[] = $comment;
        }

        // ── 15 reply comments ─────────────────────────────────────────────────
        // parent_index references the $topLevel array index created above.
        // Replies from renter users (indices 5–9) answer questions;
        // replies from regular users (indices 0–4) continue conversations.
        $replyDefinitions = [
            [
                'parent' => 0,  'user' => 5,
                'days'   => 14, 'hours' => 2,
                'text'   => 'Yes, it is available! Feel free to make a booking right away.',
            ],
            [
                'parent' => 2,  'user' => 7,
                'days'   => 13, 'hours' => 3,
                'text'   => 'The listed price includes basic insurance and roadside assistance.',
            ],
            [
                'parent' => 3,  'user' => 6,
                'days'   => 12, 'hours' => 1,
                'text'   => 'Absolutely! City center pickup is available at no extra cost.',
            ],
            [
                'parent' => 5,  'user' => 5,
                'days'   => 11, 'hours' => 4,
                'text'   => 'We allow up to 300 km per day, included in the base rental price.',
            ],
            [
                'parent' => 6,  'user' => 6,
                'days'   => 11, 'hours' => 2,
                'text'   => 'Yes, GPS navigation is a standard feature included in this car.',
            ],
            [
                'parent' => 7,  'user' => 7,
                'days'   => 10, 'hours' => 3,
                'text'   => 'Airport pickup is available! Just mention it in your booking notes.',
            ],
            [
                'parent' => 9,  'user' => 9,
                'days'   => 9,  'hours' => 1,
                'text'   => 'The minimum rental period is just 1 day — very flexible booking options!',
            ],
            [
                'parent' => 10, 'user' => 5,
                'days'   => 9,  'hours' => 5,
                'text'   => 'Full comprehensive insurance is included in the listed price.',
            ],
            [
                'parent' => 12, 'user' => 6,
                'days'   => 8,  'hours' => 2,
                'text'   => 'Yes, a refundable security deposit of ₱2,000 is required at pickup.',
            ],
            [
                'parent' => 13, 'user' => 7,
                'days'   => 7,  'hours' => 4,
                'text'   => 'We offer 10% off for weekly rentals and 20% off for monthly bookings!',
            ],
            [
                'parent' => 14, 'user' => 8,
                'days'   => 7,  'hours' => 3,
                'text'   => 'One-way rentals are possible but may incur a small extra fee. Please contact us for details.',
            ],
            [
                'parent' => 0,  'user' => 1,
                'days'   => 13, 'hours' => 6,
                'text'   => 'I booked this last month and had an absolutely fantastic experience!',
            ],
            [
                'parent' => 1,  'user' => 2,
                'days'   => 12, 'hours' => 5,
                'text'   => 'Totally agree! The interior is spotless and the drive is super smooth.',
            ],
            [
                'parent' => 11, 'user' => 3,
                'days'   => 7,  'hours' => 2,
                'text'   => 'Same experience here — already booked again for next month!',
            ],
            [
                'parent' => 4,  'user' => 0,
                'days'   => 11, 'hours' => 4,
                'text'   => 'I completely agree, this car exceeded all of my expectations!',
            ],
        ];

        foreach ($replyDefinitions as $def) {
            $parent = $topLevel[$def['parent']];
            $ts     = Carbon::now()->subDays($def['days'])->addHours($def['hours']);

            $reply = Comment::create([
                'user_id'          => $users[$def['user'] % $userCount]->id,
                // Reply lives on the same posting as its parent
                'car_posting_id'   => $parent->car_posting_id,
                'parent_comment_id' => $parent->id,
                'comment'          => $def['text'],
            ]);

            $reply->created_at = $ts;
            $reply->updated_at = $ts;
            $reply->timestamps  = false;
            $reply->save();
            $reply->timestamps  = true;
        }

        $this->command->info(
            sprintf(
                'CommentSeeder: seeded %d top-level comments and %d replies (%d total).',
                count($topLevelDefinitions),
                count($replyDefinitions),
                count($topLevelDefinitions) + count($replyDefinitions)
            )
        );
    }
}
