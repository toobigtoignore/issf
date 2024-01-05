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
        Schema::create('ssf_sota', function (Blueprint $table) {
            $table->id();
            $table->integer('issf_core_id');
            $table->text('author_names');
            $table->integer('publication_type_id');
            $table->string('other_publication_type', 100)->nullable();
            $table->text('level1_title');
            $table->text('level2_title');
            $table->integer('year');
            $table->integer('nonenglish_language_id')->nullable();
            $table->text('nonenglish_title')->nullable();
            $table->string('ssf_defined', 20)->nullable();
            $table->text('ssf_definition')->nullable();
            $table->boolean('lsf_considered')->nullable();
            $table->text('fishery_type_details')->nullable();
            $table->text('gear_type_details')->nullable();
            $table->text('ecosystem_type_details')->nullable();
            $table->boolean('demographics_na')->nullable()->default(0);
            $table->boolean('demographics_age')->nullable()->default(0);
            $table->boolean('demographics_education')->nullable()->default(0);
            $table->boolean('demographics_ethnicity')->nullable()->default(0);
            $table->boolean('demographics_gender')->nullable()->default(0);
            $table->boolean('demographics_health')->nullable()->default(0);
            $table->boolean('demographics_income')->nullable()->default(0);
            $table->boolean('demographics_religion')->nullable()->default(0);
            $table->boolean('demographics_unspecified')->nullable()->default(0);
            $table->boolean('demographics_other')->nullable()->default(0);
            $table->text('demographics_other_text')->nullable();
            $table->text('demographic_details')->nullable();
            $table->boolean('employment_na')->nullable()->default(0);
            $table->boolean('employment_full_time')->nullable()->default(0);
            $table->boolean('employment_part_time')->nullable()->default(0);
            $table->boolean('employment_seasonal')->nullable()->default(0);
            $table->boolean('employment_unspecified')->nullable()->default(0);
            $table->text('employment_details')->nullable();
            $table->boolean('stage_na')->nullable()->default(0);
            $table->boolean('stage_pre_harvest')->nullable()->default(0);
            $table->boolean('stage_harvest')->nullable()->default(0);
            $table->boolean('stage_post_harvest')->nullable()->default(0);
            $table->boolean('stage_unspecified')->nullable()->default(0);
            $table->text('market_details')->nullable();
            $table->text('governance_details')->nullable();
            $table->text('management_details')->nullable();
            $table->text('research_method')->nullable();
            $table->boolean('method_specify_qualitative')->nullable()->default(0);
            $table->boolean('method_specify_quantitative')->nullable()->default(0);
            $table->boolean('method_specify_mixed')->nullable()->default(0);
            $table->text('aim_purpose_question')->nullable();
            $table->text('theme_issue_details')->nullable();
            $table->boolean('solutions_offered')->nullable()->default(0);
            $table->text('solution_details')->nullable();
            $table->boolean('explicit_implications_recommendations')->nullable()->default(0);
            $table->text('implication_details')->nullable();
            $table->text('comments')->nullable();
            $table->text('other_research_method')->nullable();

            $table->foreign('issf_core_id')->references('issf_core_id')->on('issf_core');
            $table->foreign('publication_type_id')->references('id')->on('publication_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ssf_sota');
    }
};
