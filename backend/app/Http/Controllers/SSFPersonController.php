<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\ValidationController;
use App\Models\ISSFCore;
use App\Models\SSFPerson;
use App\Models\PersonOrganization;
use App\Models\SSFOrganization;
use App\Models\UserProfile;


class SSFPersonController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.record_type' => ['required', 'string'],
                'basic_info.geographic_scope_type' => ['required', 'string'],
                'basic_info.contributor_id' => ['required', 'exists:user_profile,id']
            ])
        );

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $issf_core_id = HelperController::create_core_record($payload);

        if(!$issf_core_id){
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
            ];
        }

        $new_person_record = SSFPerson::create([
            'issf_core_id' => $issf_core_id
        ]);

        if($new_person_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFPerson $person){
        $organizations = [];
        $organizations_ids = PersonOrganization::where('ssfperson_id', $person->issf_core_id)->get(['ssforganization_id', 'is_primary_affiliation']);
        foreach($organizations_ids as $org){
            array_push($organizations, [
                'organization_id' => $org->ssforganization_id,
                'is_primary_affiliation' => $org->is_primary_affiliation,
                'organization_name' => SSFOrganization::where('issf_core_id', $org->ssforganization_id)->first()->organization_name
            ]);
        }

        return [
            ...$person->toArray(),
            'geoscope' => HelperController::get_geoscope(
                $person->core->geographic_scope_type,
                $person->issf_core_id
            ),
            'organizations' => $organizations,
            'theme_issues' => HelperController::get_theme_issues($person->issf_core_id),
            'species' => HelperController::get_species($person->issf_core_id),
            'external_links' => HelperController::get_external_links($person->issf_core_id)
        ];
    }


    public function get_person_for_user($id){
        $person = ISSFCore::where('contributor_id', $id)
                            ->where('core_record_type', config('constants.RECORD_TYPES.WHO'))
                            ->first();

        if(!$person) return 0;
        return $person->issf_core_id;
    }


    public function update_basic(SSFPerson $record){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
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

        $payload['img'] = $record->img;
        $image_action = $payload['image_action'];
        $image_file = $payload['image_file'];
        unset($payload['image_action']);
        unset($payload['image_file']);

        if($image_file && $image_action === config('constants.IMAGE_ACTIONS.UPLOAD_IMAGE_KEY')){
            if($record->img){
                Storage::disk('ssf_person_images')->delete($record->img);
            }

            $image_name = time() . '-' . uniqid() . '-' . $image_file->getClientOriginalName();
            Storage::disk('ssf_person_images')->put($image_name, file_get_contents($image_file));
            $payload['img'] = $image_name;
        }

        else if(!$image_file && $image_action === config('constants.IMAGE_ACTIONS.REMOVE_IMAGE_KEY')){
            Storage::disk('ssf_person_images')->delete($record->img);
            $payload['img'] = null;
        }

        $primary_affiliation = $payload['primary_affiliation'];
        $selected_organizations = $payload['selected_organizations'];
        $affiliated_organizations = isset($selected_organizations) ? explode(',', trim($selected_organizations, ' ')) : [];
        if($primary_affiliation && $primary_affiliation !== ''){
            array_push($affiliated_organizations, $primary_affiliation);
        }

        PersonOrganization::where('ssfperson_id', $record->issf_core_id)->delete();
        foreach(array_unique($affiliated_organizations) as $org_id){
            PersonOrganization::create([
                'ssfperson_id' => $record->issf_core_id,
                'ssforganization_id' => $org_id,
                'is_primary_affiliation' => $org_id === $primary_affiliation
            ]);
        }

        $updated = $record->update([
            'url' => $payload['url'],
            'img' => $payload['img']
        ]);

        if($updated){
            $contributor = UserProfile::find($record->core->contributor_id);
            $organization = SSFOrganization::where('issf_core_id', $primary_affiliation)->first();

            if($organization) $affiliated_organization = $organization->organization_name;
            else $affiliated_organization = '';

            if(isset($payload['editor_is_staff']) && $payload['editor_is_staff']){
                $contributor->update([
                    'first_name' => $payload['first_name'],
                    'last_name' => $payload['last_name'],
                    'initials' => $payload['initials'],
                    'country_id' => $payload['country_id']
                ]);
            }

            $update_contributor = UserProfile::find($record->core->contributor_id);
            HelperController::update_record_summary(
                config('constants.RECORD_TYPES.WHO'),
                $record->issf_core_id,
                [
                    'first_name' => $update_contributor->first_name,
                    'initials' => $update_contributor->initials,
                    'last_name' => $update_contributor->last_name,
                    'affiliation' => $affiliated_organization,
                    'country' => $update_contributor->country->short_name
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


    public function update_researcher(SSFPerson $record){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'is_researcher' => ['required', 'boolean'],
                'number_publications' => ['integer', 'nullable'],
                'education_level' => ['string', 'nullable', 'in:Other,' . implode(',', array_values(config('constants.EDUCATION_LEVEL')))],
                'other_education_level' => ['required_if:education_level,Other', 'string', 'nullable']
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
