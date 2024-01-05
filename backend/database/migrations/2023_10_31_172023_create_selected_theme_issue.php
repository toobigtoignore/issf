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
        Schema::create('selected_theme_issue', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->integer('theme_issue_value_id')->nullable();
            $table->text('other_theme_issue')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('selected_theme_issue');
    }
};
