<?php

use App\Enum\PaymentMethodEnum;
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
        Schema::create('car_rentals', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            // car_posting_id
            $table->foreignId('car_posting_id')
                ->constrained('car_postings')
                ->onDelete('cascade');

            // user_id
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->integer('days');
            $table->decimal('deposit', 10, 2);
            $table->dateTime('start_date');
            $table->dateTime('return_date');
            $table->enum('rental_status', RentalStatusEnum::cases())->default(RentalStatusEnum::PENDING->value);
            $table->enum('payment_method', PaymentMethodEnum::cases())->default(PaymentMethodEnum::CASH->value);
            $table->string('payment_reference')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_rental');
    }
};
