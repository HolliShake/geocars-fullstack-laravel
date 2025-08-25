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
        Schema::table('car_postings', function (Blueprint $table) {
            $table->dropForeign(['company_id']); // drop FK first
            $table->dropColumn('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_postings', function (Blueprint $table) {
            $table->foreignId('company_id')
                ->constrained('user_companies')
                ->onDelete('cascade');
            $table->integer('company_id')->nullable();
        });
    }
};
