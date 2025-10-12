<?php

use App\Enum\ReactionEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            //
            $table->foreignId('car_posting_id')
                ->constrained('car_postings')
                ->onDelete('cascade');
            //
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            //
            $table->enum('reaction', array_column(ReactionEnum::cases(), 'value'))->default(ReactionEnum::LIKE->value);
        });

        // Only one reaction per user per car posting
        Schema::table('reactions', function (Blueprint $table) {
            $table->unique(['car_posting_id', 'user_id'], 'unique_reaction_per_user_per_car_posting');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
