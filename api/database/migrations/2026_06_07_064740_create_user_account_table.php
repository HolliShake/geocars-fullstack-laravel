<?php

use App\Enum\UserAccountTypeEnum;
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
        Schema::create('user_accounts', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            // user
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            //
            $table->enum('type', array_column(UserAccountTypeEnum::cases(), 'value'))->default(UserAccountTypeEnum::BANK->value);
            $table->string('account_number');
            $table->boolean('is_default', true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_accounts');
    }
};
