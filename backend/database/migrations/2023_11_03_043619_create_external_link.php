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
        Schema::create('external_link', function (Blueprint $table) {
            $table->id();
            $table->string('link_type', 100);
            $table->text('link_address');
            $table->integer('issf_core_id');
            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_link');
    }
};
