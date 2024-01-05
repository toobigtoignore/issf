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
        Schema::create('profile_organization', function (Blueprint $table) {
            $table->increments('profile_organization_id');
            $table->integer('ssfprofile_id');
            $table->integer('ssforganization_id')->nullable();
            $table->text('organization_name')->nullable();
            $table->text('organization_type')->nullable();
            $table->text('geographic_scope')->nullable();
            $table->text('organization_type_other_text')->nullable();

            $table->foreign('ssfprofile_id')->references('issf_core_id')->on('ssf_profile');
            $table->foreign('ssforganization_id')->references('issf_core_id')->on('ssf_organization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_organization');
    }
};
