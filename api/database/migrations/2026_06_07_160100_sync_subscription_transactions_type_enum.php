<?php

use App\Enum\TransactionTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $values = array_map(
            static fn (TransactionTypeEnum $case): string => "'{$case->value}'",
            TransactionTypeEnum::cases()
        );

        $enumList = implode(', ', $values);

        DB::statement("ALTER TABLE `subscription_transactions` MODIFY COLUMN `type` ENUM({$enumList}) NOT NULL DEFAULT 'payment'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Legacy set before renewal support.
        DB::statement("ALTER TABLE `subscription_transactions` MODIFY COLUMN `type` ENUM('payment', 'refund') NOT NULL DEFAULT 'payment'");
    }
};
