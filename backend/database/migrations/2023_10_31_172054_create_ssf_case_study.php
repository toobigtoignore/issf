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
        Schema::create('ssf_case_study', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('name');
            $table->text('role');
            $table->text('description_area');
            $table->text('issues_challenges');
            $table->text('stakeholders');
            $table->text('transdisciplinary');
            $table->text('description_fishery');
            $table->text('description_issues');
            $table->text('background_context');
            $table->text('activities_innovation');
            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_case_study');
    }
};
