<?php

use App\Enum\RentalStatusEnum;
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
        Schema::table('car_rentals', function (Blueprint $table) {
            $table->enum('rental_status', RentalStatusEnum::cases())
                ->default(RentalStatusEnum::PENDING->value)
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_rentals', function (Blueprint $table) {
            $table->enum('rental_status', RentalStatusEnum::cases())
                ->default(RentalStatusEnum::PENDING->value)
                ->change();
        });
    }
};
