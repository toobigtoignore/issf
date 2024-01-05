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
        Schema::create('country', function (Blueprint $table) {
            $table->integer('country_id')->primary();
            $table->text('short_name');
            $table->text('official_name')->nullable();
            $table->string('iso3', 10)->nullable();
            $table->string('iso2', 10)->nullable();
            $table->string('undp', 10)->nullable();
            $table->integer('uni')->nullable();
            $table->integer('faostat')->nullable();
            $table->integer('gaul')->nullable();
            $table->point('country_point')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country');
    }
};
