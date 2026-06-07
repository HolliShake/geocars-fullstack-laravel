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
        Schema::table('user_accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('user_accounts', 'expiry')) {
                $table->string('expiry')->nullable()->after('account_number');
            }

            if (!Schema::hasColumn('user_accounts', 'cvv')) {
                $table->string('cvv', 4)->nullable()->after('expiry');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('user_accounts', 'cvv')) {
                $table->dropColumn('cvv');
            }

            if (Schema::hasColumn('user_accounts', 'expiry')) {
                $table->dropColumn('expiry');
            }
        });
    }
};
