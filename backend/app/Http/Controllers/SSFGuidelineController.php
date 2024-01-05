<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Models\SSFGuideline;
use App\Models\ISSFCore;
use App\Models\SSFPerson;

class SSFGuidelineController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.title' => ['required', 'string'],
                'basic_info.activity_type' => ['required', 'string'],
                'basic_info.activity_coverage' => ['required', 'string'],
                'basic_info.location' => ['required', 'string'],
                'basic_info.organizer' => ['required', 'string'],
                'basic_info.purpose' => ['required', 'string'],
                'basic_info.ongoing' => ['required', 'string'],
                'basic_info.start_year' => ['required', 'integer'],
                'basic_info.start_month' => ['required', 'integer'],
                'basic_info.start_day' => ['required', 'integer'],
                'basic_info.end_year' => ['required_if:basic_info.ongoing,Yes', 'integer'],
                'basic_info.end_month' => ['required_if:basic_info.ongoing,Yes', 'integer'],
                'basic_info.end_day' => ['required_if:basic_info.ongoing,Yes', 'integer'],
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

        $guideline_id = SSFGuideline::latest('id')->first()->id + 1;
        $issf_core_id = HelperController::createCoreRecord($payload);
        if(!$issf_core_id){
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
            ];
        }

        $new_geo_scope = HelperController::createGeoscope($payload, $issf_core_id);
        if(!$new_geo_scope){
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
            ];
        }

        $new_guideline_record = SSFGuideline::create([
            'id' => $guideline_id,
            'issf_core_id' => $issf_core_id,
            'title' => $payload['basic_info']['title'],
            'activity_type' => $payload['basic_info']['activity_type'],
            'activity_coverage' => $payload['basic_info']['activity_coverage'],
            'location' => $payload['basic_info']['location'],
            'organizer' => $payload['basic_info']['organizer'],
            'purpose' => $payload['basic_info']['purpose'],
            'start_year' => $payload['basic_info']['start_year'],
            'start_month' => $payload['basic_info']['start_month'],
            'start_day' => $payload['basic_info']['start_day'],
            'ongoing' => $payload['basic_info']['ongoing'],
            'end_year' => isset($payload['basic_info']['end_year']) ?: null,
            'end_month' => isset($payload['basic_info']['end_month']) ?: null,
            'end_day' => isset($payload['basic_info']['end_day']) ?: null,
            'link' => $payload['basic_info']['link']
        ]);

        if($new_guideline_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFGuideline $guideline){
        return [
            ...$guideline->toArray(),
            ...HelperController::contributor_affiliation($guideline->core),
            'geoscope' => HelperController::get_geoscope(
                $guideline->core->geographic_scope_type,
                $guideline->issf_core_id
            )
        ];
    }


    public function update(SSFGuidelines $record){
        $payload = request()->all();
        return [
            'record' => $record,
            'payload' => $payload
        ];
        // $validator = Validator::make(
        //     $payload,
        //     array_merge(ValidationController::geographic_scope_rules(), [
        //         'basic_info.title' => ['required', 'string'],
        //         'basic_info.activity_type' => ['required', 'string'],
        //         'basic_info.activity_coverage' => ['required', 'string'],
        //         'basic_info.location' => ['required', 'string'],
        //         'basic_info.organizer' => ['required', 'string'],
        //         'basic_info.purpose' => ['required', 'string'],
        //         'basic_info.ongoing' => ['required', 'string'],
        //         'basic_info.start_year' => ['required', 'integer'],
        //         'basic_info.start_month' => ['required', 'integer'],
        //         'basic_info.start_day' => ['required', 'integer'],
        //         'basic_info.end_year' => ['required_if:basic_info.ongoing,Yes', 'integer'],
        //         'basic_info.end_month' => ['required_if:basic_info.ongoing,Yes', 'integer'],
        //         'basic_info.end_day' => ['required_if:basic_info.ongoing,Yes', 'integer'],
        //         'basic_info.record_type' => ['required', 'string'],
        //         'basic_info.geographic_scope_type' => ['required', 'in:' . implode(',', array_values(config('constants.GEO_SCOPES')))],
        //         'basic_info.contributor_id' => ['required', 'exists:user_profile,id']
        //     ])
        // );

        //  if($validator->fails()) {
        //     return [
        //         'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
        //         'errors' => [
        //             'validation' => $validator->messages()
        //         ]
        //     ];
        // }

        // $guideline_id = SSFGuideline::latest('id')->first()->id + 1;
        // $issf_core_id = HelperController::createCoreRecord($payload);
        // if(!$issf_core_id){
        //     return [
        //         'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        //     ];
        // }

        // $new_geo_scope = HelperController::createGeoscope($payload, $issf_core_id);
        // if(!$new_geo_scope){
        //     return [
        //         'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        //     ];
        // }

        // $new_guideline_record = SSFGuideline::create([
        //     'id' => $guideline_id,
        //     'issf_core_id' => $issf_core_id,
        //     'title' => $payload['basic_info']['title'],
        //     'activity_type' => $payload['basic_info']['activity_type'],
        //     'activity_coverage' => $payload['basic_info']['activity_coverage'],
        //     'location' => $payload['basic_info']['location'],
        //     'organizer' => $payload['basic_info']['organizer'],
        //     'purpose' => $payload['basic_info']['purpose'],
        //     'start_year' => $payload['basic_info']['start_year'],
        //     'start_month' => $payload['basic_info']['start_month'],
        //     'start_day' => $payload['basic_info']['start_day'],
        //     'ongoing' => $payload['basic_info']['ongoing'],
        //     'end_year' => isset($payload['basic_info']['end_year']) ?: null,
        //     'end_month' => isset($payload['basic_info']['end_month']) ?: null,
        //     'end_day' => isset($payload['basic_info']['end_day']) ?: null,
        //     'link' => $payload['basic_info']['link']
        // ]);

        // if($new_guideline_record){
        //     return [
        //         'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
        //         'record_id' => $issf_core_id
        //     ];
        // }

        // return [
        //     'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        // ];
    }
}
