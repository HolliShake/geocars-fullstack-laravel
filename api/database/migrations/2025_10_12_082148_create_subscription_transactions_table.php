<?php

use App\Enum\TransactionTypeEnum;
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
        Schema::create('subscription_transactions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            //
            $table->foreignId('user_subscription_id')
                ->constrained('user_subscriptions')
                ->onDelete('cascade');
            //
            $table->decimal('amount', 10, 2);
            $table->enum('type', array_column(TransactionTypeEnum::cases(), 'value'))->default(TransactionTypeEnum::PAYMENT->value);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_transactions');
    }
};
