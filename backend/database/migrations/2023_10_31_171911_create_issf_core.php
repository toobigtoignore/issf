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
        Schema::create('issf_core', function (Blueprint $table) {
            $table->integer('issf_core_id')->primary();
            $table->date('contribution_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->integer('contributor_id');
            $table->string('core_record_type', 100);
            $table->text('core_record_summary');
            $table->string('geographic_scope_type', 20);
            $table->date('edited_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->integer('editor_id');

            $table->foreign('contributor_id')->references('id')->on('user_profile');
            $table->foreign('editor_id')->references('id')->on('user_profile');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issf_core');
    }
};
