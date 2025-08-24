<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enum\CarTypeEnum;
use App\Enum\FuelTypeEnum;
use App\Enum\TransmissionTypeEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_company_id')
                ->constrained('user_companies')
                ->onDelete('cascade');
            $table->string('brand');
            $table->string('model');
            $table->string('plate_number');
            $table->string('color');
            $table->enum('type', array_column(CarTypeEnum::cases(), 'value'))->default(CarTypeEnum::SEDAN->value);
            $table->string('year')->nullable();
            $table->enum('fuel_type', array_column(FuelTypeEnum::cases(), 'value'))->default(FuelTypeEnum::PETROL->value);
            $table->enum('transmission', array_column(TransmissionTypeEnum::cases(), 'value'))->default(TransmissionTypeEnum::MANUAL->value);
            $table->string('engine_capacity')->nullable();
            $table->string('engine_power')->nullable();
            $table->string('engine_torque')->nullable();
            $table->string('engine_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
