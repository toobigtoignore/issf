<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                'basic_info.ssf_definition' => ['required_if:ssf_defined,' . config('constants.DEFINED_ANSWERS.YES')],
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

        $is_ongoing = 0;
        if($payload['basic_info']['end_year'] == 0){
            $is_ongoing = 1;
        }

        $new_profile_record = SSFProfile::create([
            'id' => $profile_id,
            'issf_core_id' => $issf_core_id,
            'ssf_name' => $payload['basic_info']['ssf_name'],
            'ssf_defined' => $payload['basic_info']['ssf_defined'],
            'ssf_definition' => $payload['basic_info']['ssf_definition'],
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
                    'organization_id' => $org->ssforganization_id,
                    'enlisted' => true,
                    'name' => $org->organization->core->organization_name,
                    'type' => $org->organization_type,
                    'other' => $org->organization_type_other_text,
                    'geoscope' => $org->organization->core->geographic_scope_type
                ));
            }
            else {
                array_push($organizations, array(
                    'name' => $org->organization_name,
                    'type' => $org->organization_type,
                    'other' => $org->organization_type_other_text,
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


    public function update_details(SSFProfile $record){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'ssf_name' => ['required', 'string'],
                'start_year' => ['required', 'integer', 'max:' . date("Y")],
                'end_year' => ['required', 'integer', 'max:' . date("Y")],
                'ssf_defined' => ['required', 'string', 'max:20', 'in:' . implode(',', array_values(config('constants.DEFINED_ANSWERS')))],
                'ssf_definition' => ['required_if:ssf_defined,' . config("constants.DEFINED_ANSWERS.YES"), 'string', 'nullable'],
                'image_action' => ['in:' . implode(',', array_values(config('constants.IMAGE_ACTIONS')))]
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

        $payload['ongoing'] = $payload['end_year'] === 0;
        $payload['img'] = $record->img;
        $image_action = $payload['image_action'];
        $image_file = $payload['image_file'];
        unset($payload['image_action']);
        unset($payload['image_file']);

        if($image_file && $image_action === config('constants.IMAGE_ACTIONS.UPLOAD_IMAGE_KEY')){
            if($record->img){
                Storage::disk('ssf_profile_images')->delete($record->img);
            }

            $image_name = time() . '-' . uniqid() . '-' . $image_file->getClientOriginalName();
            Storage::disk('ssf_profile_images')->put($image_name, file_get_contents($image_file));
            $payload['img'] = $image_name;
        }

        else if(!$image_file && $image_action === config('constants.IMAGE_ACTIONS.REMOVE_IMAGE_KEY')){
            Storage::disk('ssf_profile_images')->delete($record->img);
            $payload['img'] = null;
        }

        $formatted_payload = [];
        foreach(array_keys($payload) as $key) $formatted_payload[$key] = $payload[$key];
        $updated = $record->update($formatted_payload);

        if($updated){
            HelperController::update_record_summary(
                config('constants.RECORD_TYPES.PROFILE'),
                $record->issf_core_id,
                [
                    'ongoing' => $payload['ongoing'],
                    'start_year' => $payload['start_year'],
                    'end_year' => $payload['end_year'],
                    'ssf_name' => $payload['ssf_name']
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


    public function update_organizations(SSFProfile $record){
        $payload = request()->all();
        ProfileOrganization::where('ssfprofile_id', $record->issf_core_id)->delete();

        foreach($payload as $entry) {
            ProfileOrganization::create([
                'ssfprofile_id' => $record->issf_core_id,
                'ssforganization_id' => $entry['ssforganization'],
                'organization_name' => $entry['organization_name'],
                'organization_type' => $entry['organization_type'],
                'organization_type_other_text' => $entry['organization_type_other_text'],
                'geographic_scope' => $entry['geographic_scope']
            ]);
        };

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public function update_sources(SSFProfile $record){
        $payload = request()->all();
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
