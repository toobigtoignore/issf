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
        Schema::create('socialapp', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('provider', 30);
            $table->string('name', 40);
            $table->text('client_id');
            $table->text('secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('socialapp');
    }
};
