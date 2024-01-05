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
        Schema::create('user_profile', function (Blueprint $table) {
            $table->id();
            $table->string('password', 512);
            $table->timestamp('last_login')->nullable();
            $table->boolean('is_superuser')->default(false);
            $table->string('username', 30)->unique();
            $table->string('first_name', 30)->nullable();
            $table->string('last_name', 30)->nullable();
            $table->string('email', 100)->unique();
            $table->boolean('is_staff')->default(false);
            $table->boolean('is_active')->default(false);
            $table->timestamp('date_joined')->useCurrent();
            $table->string('initials', 10)->nullable();
            $table->integer('country_id')->nullable();
            $table->foreign('country_id')->references('country_id')->on('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profile');
    }
};
