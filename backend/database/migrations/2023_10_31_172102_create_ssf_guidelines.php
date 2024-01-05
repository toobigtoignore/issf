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
        Schema::create('ssf_guidelines', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('title');
            $table->text('location');
            $table->integer('start_day');
            $table->integer('start_month');
            $table->integer('start_year');
            $table->integer('end_day')->nullable();
            $table->integer('end_month')->nullable();
            $table->integer('end_year')->nullable();
            $table->text('organizer');
            $table->text('purpose');
            $table->text('link')->nullable();
            $table->text('address1')->nullable();
            $table->text('address2')->nullable();
            $table->text('city_town')->nullable();
            $table->text('prov_state')->nullable();
            $table->integer('country_id')->nullable();
            $table->text('postal_code')->nullable();
            $table->point('guidelines_point')->nullable();
            $table->text('activity_type');
            $table->text('activity_coverage');
            $table->string('ongoing', 20);
            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_guidelines');
    }
};
