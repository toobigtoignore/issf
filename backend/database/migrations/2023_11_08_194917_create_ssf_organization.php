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
        Schema::create('ssf_organization', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->integer('issf_core_id');
            $table->text('organization_name');
            $table->text('mission')->nullable();
            $table->text('activities')->nullable();
            $table->boolean('is_tbti_partner')->nullable();
            $table->boolean('is_ssf')->nullable();
            $table->text('address1')->nullable();
            $table->text('address2')->nullable();
            $table->string('prov_state', 100)->nullable();
            $table->integer('country_id')->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->point('organization_point')->nullable();
            $table->string('city_town', 100)->nullable();
            $table->integer('year_established');
            $table->string('ssf_defined', 30);
            $table->text('ssf_definition')->nullable();
            $table->boolean('organization_type_union')->default(false);
            $table->boolean('organization_type_support')->default(false);
            $table->boolean('organization_type_coop')->default(false);
            $table->boolean('organization_type_flag')->default(false);
            $table->boolean('organization_type_other')->default(false);
            $table->text('organization_type_other_text')->nullable();
            $table->boolean('motivation_voice')->default(false);
            $table->boolean('motivation_market')->default(false);
            $table->boolean('motivation_sustainability')->default(false);
            $table->boolean('motivation_economics')->default(false);
            $table->boolean('motivation_rights')->default(false);
            $table->boolean('motivation_collaboration')->default(false);
            $table->boolean('motivation_other')->default(false);
            $table->text('motivation_other_text')->nullable();
            $table->boolean('activities_capacity')->default(false);
            $table->boolean('activities_sustainability')->default(false);
            $table->boolean('activities_networking')->default(false);
            $table->boolean('activities_marketing')->default(false);
            $table->boolean('activities_collaboration')->default(false);
            $table->boolean('activities_other')->default(false);
            $table->text('activities_other_text')->nullable();
            $table->boolean('network_types_state')->default(false);
            $table->boolean('network_types_ssfos')->default(false);
            $table->boolean('network_types_community')->default(false);
            $table->boolean('network_types_society')->default(false);
            $table->boolean('network_types_ngos')->default(false);
            $table->boolean('network_types_other')->default(false);
            $table->text('network_types_other_text')->nullable();
            $table->text('achievements')->nullable();
            $table->text('success_factors')->nullable();
            $table->text('obstacles')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_organization');
    }
};
