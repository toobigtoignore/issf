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
        Schema::create('gs_region', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('region_name_other')->nullable();
            $table->integer('region_id');
            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
            $table->foreign('region_id')->references('id')->on('region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gs_region');
    }
};
