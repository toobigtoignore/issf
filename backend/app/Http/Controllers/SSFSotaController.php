<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\ValidationController;
use App\Models\ISSFCore;
use App\Models\SSFSota;
use App\Models\PublicationType;


class SSFSotaController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.author_names' => ['required'],
                'basic_info.publication_type_id' => ['required'],
                'basic_info.other_publication_type' => ['required_if:basic_info.publication_type_id,9', 'max:100'],
                'basic_info.level1_title' => ['required'],
                'basic_info.level2_title' => ['required'],
                'basic_info.year' => ['required', 'max:' . date("Y")],
                'basic_info.record_type' => ['required', 'string'],
                'basic_info.geographic_scope_type' => ['required', 'in:' . implode(',', array_values(config('constants.GEO_SCOPES')))],
                'basic_info.contributor_id' => ['required', 'exists:user_profile,id']
            ])
        );

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $sota_id = SSFSota::latest('id')->first()->id + 1;
        $issf_core_id = HelperController::create_core_record($payload);
        if(!$issf_core_id){
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
            ];
        }

        $new_geo_scope = HelperController::create_geo_scope($payload, $issf_core_id);
        if(!$new_geo_scope){
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
            ];
        }

        $new_sota_record = SSFSota::create([
            'id' => $sota_id,
            'issf_core_id' => $issf_core_id,
            'author_names' => $payload['basic_info']['author_names'],
            'publication_type_id' => $payload['basic_info']['publication_type_id'],
            'other_publication_type' => isset($payload['basic_info']['other_publication_type']) ?: null,
            'level1_title' => $payload['basic_info']['level1_title'],
            'level2_title' => $payload['basic_info']['level2_title'],
            'year' => $payload['basic_info']['year']
        ]);

        if($new_sota_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFSota $sota){
        $demographic_factors = HelperController::formulate_list(config('constants.SOTA_DEMOGRAPHIC_FACTORS'), $sota, 1, 'demographics_other_text');
        $employment_statuses = HelperController::formulate_list(config('constants.SOTA_EMPLOYMENT_STATUS'), $sota, 1, null);
        $fishery_stages = HelperController::formulate_list(config('constants.SOTA_FISHERY_STAGE'), $sota, 1, null);

        return [
            ...$sota->toArray(),
            ...HelperController::contributor_affiliation($sota->core),
            'geoscope' => HelperController::get_geoscope(
                $sota->core->geographic_scope_type,
                $sota->issf_core_id
            ),
            'attributes' => HelperController::get_attributes($sota->issf_core_id),
            'demographic_factors' => $demographic_factors,
            'employment_statuses' => $employment_statuses,
            'fishery_stages' => $fishery_stages,
            'theme_issues' => HelperController::get_theme_issues($sota->issf_core_id),
            'species' => HelperController::get_species($sota->issf_core_id),
            'external_links' => HelperController::get_external_links($sota->issf_core_id)
        ];
    }


    public function update_basic(SSFSota $record){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'author_names' => ['required', 'string'],
                'publication_type_id' => ['required', 'integer', 'in:' . implode(',', array_keys(config('constants.SOTA_PUBLICATION_TYPES')))],
                'other_publication_type' => ['required_if:publication_type_id,9', 'string', 'max:100',  'nullable'],
                'level1_title' => ['required', 'string'],
                'level2_title' => ['required', 'string'],
                'year' => ['required', 'integer', 'max:' . date("Y")]
            ]
        );

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $formatted_payload = [];
        foreach(array_keys($payload) as $key) $formatted_payload[$key] = $payload[$key];
        $updated = $record->update($formatted_payload);

        if($updated){
            $publication_type = $payload['other_publication_type'] ?: PublicationType::find($payload['publication_type_id'])->publication_type;
            HelperController::update_record_summary(
                config('constants.RECORD_TYPES.SOTA'),
                $record->issf_core_id,
                [
                    'level1_title' => $payload['level1_title'],
                    'level2_title' => $payload['level2_title'],
                    'author_names' => $payload['author_names'],
                    'year' => $payload['year'],
                    'publication_type' => $publication_type
                ]
            );

            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function update_additional_details(SSFSota $record){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'demographics_other_text' => ['required_if:demographics_other,' . config("constants.DEFINED_ANSWERS.YES"), 'string', 'nullable'],
                'ssf_defined' => [ 'in:,' . implode(',', array_values(config('constants.DEFINED_ANSWERS')))],
                'ssf_definition' => ['required_if:ssf_defined,' . config("constants.DEFINED_ANSWERS.YES")]
            ]
        );

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $formatted_payload = [];
        foreach(array_keys($payload) as $key) $formatted_payload[$key] = $payload[$key];
        $updated = $record->update($formatted_payload);

        if($updated){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }
}
