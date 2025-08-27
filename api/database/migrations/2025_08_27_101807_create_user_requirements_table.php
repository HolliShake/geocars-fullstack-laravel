<?php

use App\Enum\RoleEnum;
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
        Schema::create('user_requirements', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            // Fk user_id
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            // Fk requirement_id
            $table->foreignId('requirement_id')
                ->constrained('requirements')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requirements');
    }
};
