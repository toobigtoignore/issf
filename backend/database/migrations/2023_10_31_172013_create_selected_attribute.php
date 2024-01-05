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
        Schema::create('selected_attribute', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->integer('attribute_id');
            $table->text('value')->nullable();
            $table->integer('attribute_value_id')->nullable();
            $table->text('other_value')->nullable();
            $table->text('additional')->nullable();
            $table->integer('additional_value_id')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
            $table->foreign('attribute_id')->references('id')->on('attribute');
            $table->foreign('attribute_value_id')->references('id')->on('attribute_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('selected_attribute');
    }
};
