<?php

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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            //
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            //
            $table->foreignId('car_posting_id')
                ->constrained('car_postings')
                ->onDelete('cascade');
            //
            $table->foreignId('parent_comment_id')
                ->nullable()
                ->constrained('comments')
                ->onDelete('cascade');
            //
            $table->text('comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comment');
    }
};
