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
        Schema::create('theme_issue_values', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->text('label');
            $table->integer('category_id');

            $table->foreign('category_id')->references('id')->on('theme_issue_categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_issue_values');
    }
};
