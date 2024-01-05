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
        Schema::create('ssf_bluejustice', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('name')->nullable();
            $table->string('email', 100)->nullable();
            $table->text('affiliation')->nullable();
            $table->string('country', 200)->nullable();
            $table->text('role')->nullable();
            $table->text('photo_location')->nullable();
            $table->string('date_of_photo', 50)->nullable();
            $table->text('photographer', 150)->nullable();
            $table->text('ssf_location');
            $table->integer('ssf_country');
            $table->string('ssf_main_species', 100)->nullable();
            $table->string('ssf_type_aquaculture', 100)->nullable();
            $table->string('ssf_type_recreational', 100)->nullable();
            $table->string('ssf_type_commercial', 100)->nullable();
            $table->string('ssf_type_subsistence', 100)->nullable();
            $table->string('ssf_type_indigenous', 100)->nullable();
            $table->string('ssf_type_other')->nullable();
            $table->text('ssf_name');
            $table->string('ecosystem_type_marine', 100)->nullable();
            $table->string('ecosystem_type_freshwater', 100)->nullable();
            $table->string('ecosystem_type_brackish', 100)->nullable();
            $table->string('ecosystem_detailed_archipelago', 100)->nullable();
            $table->string('ecosystem_detailed_beach', 100)->nullable();
            $table->string('ecosystem_detailed_coastal', 100)->nullable();
            $table->string('ecosystem_detailed_coral_reef', 100)->nullable();
            $table->string('ecosystem_detailed_deep_sea', 100)->nullable();
            $table->string('ecosystem_detailed_estuary', 100)->nullable();
            $table->string('ecosystem_detailed_fjord', 100)->nullable();
            $table->string('ecosystem_detailed_intertidal', 100)->nullable();
            $table->string('ecosystem_detailed_lagoon', 100)->nullable();
            $table->string('ecosystem_detailed_lake', 100)->nullable();
            $table->string('ecosystem_detailed_mangrove', 100)->nullable();
            $table->string('ecosystem_detailed_open_ocean', 100)->nullable();
            $table->string('ecosystem_detailed_river', 100)->nullable();
            $table->string('ecosystem_detailed_salt_marsh', 100)->nullable();
            $table->text('ecosystem_detailed_other')->nullable();
            $table->string('ssf_terms_artisanal', 100)->nullable();
            $table->string('ssf_terms_coastal', 100)->nullable();
            $table->string('ssf_terms_indigenous', 100)->nullable();
            $table->string('ssf_terms_inland', 100)->nullable();
            $table->string('ssf_terms_inshore', 100)->nullable();
            $table->string('ssf_terms_small_boat', 100)->nullable();
            $table->string('ssf_terms_small_scale', 100)->nullable();
            $table->string('ssf_terms_subsistence', 100)->nullable();
            $table->string('ssf_terms_traditional', 100)->nullable();
            $table->text('ssf_terms_others')->nullable();
            $table->string('ssf_terms_fisheries', 100)->nullable();
            $table->string('ssf_terms_fisheries_definiton', 100)->nullable();
            $table->string('main_gears_dredge', 100)->nullable();
            $table->string('main_gears_lift_net', 100)->nullable();
            $table->string('main_gears_cast_net', 100)->nullable();
            $table->string('main_gears_poison', 100)->nullable();
            $table->string('main_gears_gillnet', 100)->nullable();
            $table->string('main_gears_recreational_fishing_gears', 100)->nullable();
            $table->string('main_gears_gleaning', 100)->nullable();
            $table->string('main_gears_seine_net', 100)->nullable();
            $table->string('main_gears_harpoon', 100)->nullable();
            $table->string('main_gears_surrounding_net', 100)->nullable();
            $table->string('main_gears_harvesting_machines', 100)->nullable();
            $table->string('main_gears_traps', 100)->nullable();
            $table->string('main_gears_hook_line', 100)->nullable();
            $table->string('main_gears_trawls', 100)->nullable();
            $table->text('main_gears_others')->nullable();
            $table->string('main_vessel_type', 100)->nullable();
            $table->string('main_vessel_number', 100)->nullable();
            $table->string('main_vessel_engine', 100)->nullable();
            $table->string('ss_fishers_numbers', 100)->nullable();
            $table->string('ss_fishers_full_time', 100)->nullable();
            $table->string('ss_fishers_women', 100)->nullable();
            $table->string('total_number_households', 100)->nullable();
            $table->string('households_participation_percentage', 100)->nullable();
            $table->text('background_about_ssf')->nullable();
            $table->text('justice_in_context')->nullable();
            $table->string('types_of_justice_distributive', 100)->nullable();
            $table->string('types_of_justice_social', 100)->nullable();
            $table->string('types_of_justice_economic', 100)->nullable();
            $table->string('types_of_justice_market', 100)->nullable();
            $table->string('types_of_justice_infrastructure', 100)->nullable();
            $table->string('types_of_justice_regulatory', 100)->nullable();
            $table->string('types_of_justice_procedural', 100)->nullable();
            $table->string('types_of_justice_environmental', 100)->nullable();
            $table->text('types_of_justice_others')->nullable();
            $table->text('dealing_with_justice')->nullable();
            $table->text('covid_19_related')->nullable();
            $table->text('social_justice_source')->nullable();
            $table->text('bluejustice_pdf')->nullable();
            $table->text('uploaded_img')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_bluejustice');
    }
};
