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
        Schema::create('ssf_person', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->integer('number_publications')->nullable();
            $table->text('education_level')->nullable();
            $table->text('memberships')->nullable();
            $table->text('research_method')->nullable();
            $table->text('issues_addressed')->nullable();
            $table->text('url')->nullable();
            $table->text('other_education_level')->nullable();
            $table->text('affiliation')->nullable();
            $table->text('address1')->nullable();
            $table->text('address2')->nullable();
            $table->text('city_town')->nullable();
            $table->text('prov_state')->nullable();
            $table->integer('country_id')->nullable();
            $table->text('postal_code')->nullable();
            $table->point('person_point')->nullable();
            $table->boolean('is_researcher')->default(false);
            $table->text('img_url')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_person');
    }
};
