<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\HelperController;
use Illuminate\Support\Facades\Validator;
use App\Models\UserProfile;
use App\Models\ISSFCore;
use App\Models\PersonOrganization;
use App\Models\SSFOrganization;
use App\Models\SSFPerson;
use App\Models\Country;


class UserProfileController extends Controller
{
    public function get_users_without_person_profile(){
        $user_id_list = ISSFCore::where('core_record_type', config('constants.RECORD_TYPES.WHO'))
                        ->without('contributor')
                        ->get(['contributor_id'])
                        ->map(fn($user) => $user->contributor_id);

        $users_without_person_profile = UserProfile::whereNotIn('id', $user_id_list)
                                        ->where('is_active', 1)
                                        ->get(['id', 'first_name', 'initials', 'last_name', 'email', 'country_id']);
        return $users_without_person_profile;
    }


    public function update_user(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'first_name' => ['required', 'string'],
                'last_name' => ['required', 'string'],
                'country_id' => ['required', 'integer'],
                'email' => ['required', 'email']
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

        $email = $payload['email'];
        unset($payload['email']);

        $formatted_payload = [];
        foreach(array_keys($payload) as $key) $formatted_payload[$key] = $payload[$key];
        $record = UserProfile::where('email', $email)->first();
        $updated = $record->update($formatted_payload);

        if($updated){
            $country = Country::find($payload['country_id'])->short_name;
            $person_record = ISSFCore::where('contributor_id', $record->id)->where('core_record_type', config('constants.RECORD_TYPES.WHO'))->first();

            if($person_record){
                $person_issf_core_id = $person_record->issf_core_id;
                $person_organization = PersonOrganization::where('ssfperson_id', $person_issf_core_id)->where('is_primary_affiliation', true)->first();
                if($person_organization){
                    $org_id = $person_organization->ssforganization_id;
                    $organization = SSFOrganization::where('issf_core_id', $org_id)->first();
                    if($organization) $affiliation = $organization->organization_name;
                    else $affiliation = '';
                }
                else $affiliation = SSFPerson::where('issf_core_id', $person_issf_core_id)->first()->affiliation;

                HelperController::update_record_summary(
                    config('constants.RECORD_TYPES.WHO'),
                    $person_issf_core_id,
                    [
                        'first_name' => $payload['first_name'],
                        'initials' => $payload['initials'],
                        'last_name' => $payload['last_name'],
                        'affiliation' => $affiliation,
                        'country' => $country
                    ]
                );
            }

            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }
}
