<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Models\SSFOrganization;
use App\Models\ISSFCore;
use App\Models\SSFPerson;

class SSFOrganizationController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.organization_name' => ['required'],
                'basic_info.country_id' => ['required'],
                'basic_info.year_established' => ['required', 'max:' . date("Y")],
                'basic_info.ssf_defined' => ['required', 'in:' . implode(',', array_values(config('constants.DEFINED_ANSWERS')))],
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

        $org_id = SSFOrganization::latest('id')->first()->id + 1;
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

        $new_org_record = SSFOrganization::create([
            'id' => $org_id,
            'issf_core_id' => $issf_core_id,
            'organization_name' => $payload['basic_info']['organization_name'],
            'country_id' => $payload['basic_info']['country_id'],
            'year_established' => $payload['basic_info']['year_established'],
            'ssf_defined' => $payload['basic_info']['ssf_defined'],
        ]);

        if($new_org_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFOrganization $organization){
        $motivation_list = HelperController::formulate_list(config('constants.MOTIVATION_LIST'), $organization, 1, 'motivation_other_text');
        $main_activities_list = HelperController::formulate_list(config('constants.MAIN_ACTIVITIES_LIST'), $organization, 1, 'activities_other_text');
        $network_types_list = HelperController::formulate_list(config('constants.NETWORK_TYPES_LIST'), $organization, 1, 'network_types_other_text');
        $organization_type_list = HelperController::formulate_list(config('constants.ORGANIZATION_TYPE_LIST'), $organization, 1, 'organization_type_other_text');

        return [
            ...$organization->toArray(),
            ...HelperController::contributor_affiliation($organization->core),
            'geoscope' => HelperController::get_geoscope(
                $organization->core->geographic_scope_type,
                $organization->issf_core_id
            ),
            'main_activities_list' => $main_activities_list,
            'motivation_list' => $motivation_list,
            'network_types_list' => $network_types_list,
            'organization_type_list' => $organization_type_list,
            'theme_issues' => HelperController::get_theme_issues($organization->issf_core_id),
            'external_links' => HelperController::get_external_links($organization->issf_core_id)
        ];
    }
}
