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
        Schema::create('ssf_profile', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('ssf_name');
            $table->string('ssf_defined', 20);
            $table->text('ssf_definition')->nullable();
            $table->boolean('ongoing')->nullable();
            $table->integer('start_year');
            $table->integer('end_year')->nullable();
            $table->text('comments')->nullable();
            $table->text('sources')->nullable();
            $table->integer('percent')->default(10);
            $table->text('img')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_profile');
    }
};
