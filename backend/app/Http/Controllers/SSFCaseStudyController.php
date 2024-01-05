<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ISSFCore;
use App\Models\SSFPerson;
use App\Models\SSFCaseStudy;

class SSFCaseStudyController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.name' => ['required', 'string'],
                'basic_info.role' => ['required', 'string'],
                'basic_info.description_area' => ['required', 'string'],
                'basic_info.issues_challenges' => ['required', 'string'],
                'basic_info.stakeholders' => ['required', 'string'],
                'basic_info.transdisciplinary' => ['required', 'string'],
                'basic_info.description_fishery' => ['required', 'string'],
                'basic_info.description_issues' => ['required', 'string'],
                'basic_info.background_context' => ['required', 'string'],
                'basic_info.activities_innovation' => ['required', 'string'],
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

        $case_id = SSFCaseStudy::latest('id')->first()->id + 1;
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

        $new_case_record = SSFCaseStudy::create([
            'id' => $case_id,
            'issf_core_id' => $issf_core_id,
            'name' => $payload['basic_info']['name'],
            'role' => $payload['basic_info']['role'],
            'description_area' => $payload['basic_info']['description_area'],
            'issues_challenges' => $payload['basic_info']['issues_challenges'],
            'stakeholders' => $payload['basic_info']['stakeholders'],
            'transdisciplinary' => $payload['basic_info']['transdisciplinary'],
            'description_fishery' => $payload['basic_info']['description_fishery'],
            'description_issues' => $payload['basic_info']['description_issues'],
            'background_context' => $payload['basic_info']['background_context'],
            'activities_innovation' => $payload['basic_info']['activities_innovation']
        ]);

        if($new_case_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFCaseStudy $case){
        return [
            ...$case->toArray(),
            ...HelperController::contributor_affiliation($case->core),
            'geoscope' => HelperController::get_geoscope(
                $case->core->geographic_scope_type,
                $case->issf_core_id
            )
        ];
    }
}
