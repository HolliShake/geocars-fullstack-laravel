<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
            CREATE TRIGGER after_user_insert
            AFTER INSERT ON users
            FOR EACH ROW
            BEGIN
                IF NEW.role = "user" THEN
                    INSERT INTO user_subscriptions (user_id, plan_id, created_at, updated_at)
                    VALUES (NEW.id, 1, NOW(), NOW());
                END IF;
            END;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_user_insert');
    }
};
