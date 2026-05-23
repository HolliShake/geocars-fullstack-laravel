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
        Schema::create('device_location', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            // Fk
            $table->foreignId('device_id')
                ->constrained('devices')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_location');
    }
};
