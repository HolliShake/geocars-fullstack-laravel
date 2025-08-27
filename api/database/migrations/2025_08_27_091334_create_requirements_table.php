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
        Schema::create('requirements', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            // name
            $table->string('name');
            // description
            $table->text('description');
            // is_required
            $table->boolean('is_required')->default(false);
            // is_active
            $table->boolean('is_active')->default(true);
            // role
            $table->enum('role', array_column(RoleEnum::cases(), 'value'))->default(RoleEnum::USER->value);
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
