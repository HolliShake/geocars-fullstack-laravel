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
        Schema::create('car_postings', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            // car_id
            $table->foreignId('car_id')
                ->constrained('cars')
                ->onDelete('cascade');
            // company_id
            $table->foreignId('company_id')
                ->constrained('user_companies')
                ->onDelete('cascade');
            //
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('description');
            $table->decimal('price', 10, 2);
            $table->boolean('force_enabled')->default(false); // bypass show even end_date is passed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_postings');
    }
};
