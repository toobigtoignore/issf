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
        Schema::create('gs_region_country', function (Blueprint $table) {
            $table->id();
            $table->integer('region_id');
            $table->integer('country_id');

            $table->foreign('region_id')->references('id')->on('gs_region');
            $table->foreign('country_id')->references('country_id')->on('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gs_region_country');
    }
};
