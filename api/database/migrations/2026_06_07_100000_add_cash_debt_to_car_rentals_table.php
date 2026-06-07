<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds a `cash_debt` column to track how much the renter still owes
     * when the payment method is cash. The value is set when the rental
     * is confirmed and is updated when the rental is finished (to include
     * any late-return additional charges). A null value means the rental
     * is not a cash payment or the debt has been settled.
     */
    public function up(): void
    {
        Schema::table('car_rentals', function (Blueprint $table) {
            $table->decimal('cash_debt', 10, 2)->nullable()->default(null)->after('payment_reference');
            $table->boolean('cash_debt_settled')->default(false)->after('cash_debt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_rentals', function (Blueprint $table) {
            $table->dropColumn(['cash_debt', 'cash_debt_settled']);
        });
    }
};
