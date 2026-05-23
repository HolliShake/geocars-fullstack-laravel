<?php

namespace Database\Seeders;

use App\Enum\RoleEnum;
use App\Models\CarPosting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReactionSeeder extends Seeder
{
    /**
     * Weighted probability buckets (cumulative, out of 100):
     *   like    →  1–40  (40%)
     *   love    → 41–60  (20%)
     *   wow     → 61–75  (15%)
     *   haha    → 76–85  (10%)
     *   dislike → 86–95  (10%)
     *   sad     → 96–100  (5%)
     */
    private const REACTION_WEIGHTS = [
        40  => 'like',
        60  => 'love',
        75  => 'wow',
        85  => 'haha',
        95  => 'dislike',
        100 => 'sad',
    ];

    /**
     * Percentage of postings each user will react to (~60 %).
     */
    private const REACTION_RATE = 60;

    /**
     * Rows per INSERT batch.
     */
    private const BATCH_SIZE = 50;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // All non-admin users: 5 role='user' + 5 role='renter' = 10 users
        $users = User::where('role', '!=', RoleEnum::ADMIN->value)
            ->orderBy('id')
            ->get();

        // Seed reactions against the first 20 car postings only
        $postings = CarPosting::orderBy('id')
            ->take(20)
            ->get();

        $now     = now()->toDateTimeString();
        $records = [];
        // Track (car_posting_id, user_id) pairs locally to guarantee no
        // duplicate attempts even before hitting the DB unique constraint.
        $seen    = [];

        foreach ($users as $user) {
            foreach ($postings as $posting) {
                // Skip ~40 % of postings so each user reacts to roughly 60 %
                if (rand(1, 100) > self::REACTION_RATE) {
                    continue;
                }

                $pairKey = "{$posting->id}_{$user->id}";

                if (isset($seen[$pairKey])) {
                    continue;
                }

                $seen[$pairKey] = true;

                $records[] = [
                    'car_posting_id' => $posting->id,
                    'user_id'        => $user->id,
                    'reaction'       => $this->weightedReaction(),
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }
        }

        // Insert in batches; insertOrIgnore is the final safety net against the
        // UNIQUE(car_posting_id, user_id) constraint should any duplicates slip through.
        foreach (array_chunk($records, self::BATCH_SIZE) as $batch) {
            DB::table('reactions')->insertOrIgnore($batch);
        }

        $this->command->info(
            sprintf(
                'ReactionSeeder: seeded %d reactions across %d users and %d postings.',
                count($records),
                $users->count(),
                $postings->count()
            )
        );
    }

    /**
     * Pick a reaction type according to the configured weighted distribution.
     */
    private function weightedReaction(): string
    {
        $roll = rand(1, 100);

        foreach (self::REACTION_WEIGHTS as $threshold => $reaction) {
            if ($roll <= $threshold) {
                return $reaction;
            }
        }

        // Fallback — should never be reached given the weights sum to 100
        return 'like';
    }
}
