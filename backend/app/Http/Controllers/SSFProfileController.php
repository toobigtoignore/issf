<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Models\ISSFCore;
use App\Models\SSFProfile;
use App\Models\ProfileOrganization;

class SSFProfileController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.ssf_name' => ['required'],
                'basic_info.start_year' => ['required'],
                'basic_info.end_year' => ['required'],
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

        $profile_id = SSFProfile::latest('id')->first()->id + 1;
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

        $is_ongoing = 0;
        if($payload['basic_info']['end_year'] == 0){
            $is_ongoing = 1;
        }

        $new_profile_record = SSFProfile::create([
            'id' => $profile_id,
            'issf_core_id' => $issf_core_id,
            'ssf_name' => $payload['basic_info']['ssf_name'],
            'ssf_defined' => $payload['basic_info']['ssf_defined'],
            'ongoing' => $is_ongoing,
            'start_year' => $payload['basic_info']['start_year'],
            'end_year' => $payload['basic_info']['end_year']
        ]);

        if($new_profile_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFProfile $profile){
        $profile_organizations = ProfileOrganization::where('ssfprofile_id', $profile->issf_core_id)
                                            ->with('organization')
                                            ->get(['ssforganization_id', 'organization_name', 'organization_type', 'geographic_scope', 'organization_type_other_text']);

        $organizations = [];
        foreach($profile_organizations as $org){
            if($org->ssforganization_id){
                array_push($organizations, array(
                    'issf_core_id' => $org->ssforganization_id,
                    'name' => $org->organization->core->organization_name,
                    'type' => $org->organization_type,
                    'geoscope' => $org->organization->core->geographic_scope_type
                ));
            }
            else {
                $org_type = $org->organization_type_other_text;
                if(!$org_type || $org_type === '') {
                    $org_type = $org->organization_type;
                }
                array_push($organizations, array(
                    'name' => $org->organization_name,
                    'type' => $org_type,
                    'geoscope' => $org->geographic_scope
                ));
            }
        }

        return [
            ...$profile->toArray(),
            ...HelperController::contributor_affiliation($profile->core),
            'geoscope' => HelperController::get_geoscope(
                $profile->core->geographic_scope_type,
                $profile->issf_core_id
            ),
            'organizations' => $organizations,
            'attributes' => HelperController::get_attributes($profile->issf_core_id),
            'species' => HelperController::get_species($profile->issf_core_id),
            'external_links' => HelperController::get_external_links($profile->issf_core_id)
        ];
    }
}
