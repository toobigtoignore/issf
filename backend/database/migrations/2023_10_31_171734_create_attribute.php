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
        Schema::create('attribute', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('attribute_category', 20);
            $table->text('attribute_label');
            $table->string('attribute_type', 30)->nullable();
            $table->text('units_label')->nullable();
            $table->text('additional_field')->nullable();
            $table->text('additional_field_type')->nullable();
            $table->integer('min_value')->nullable();
            $table->integer('max_value')->nullable();
            $table->integer('additional_min_value')->nullable();
            $table->integer('additional_max_value')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute');
    }
};
