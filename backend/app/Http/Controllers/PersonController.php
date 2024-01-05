<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\ValidationController;
use App\Models\ISSFCore;
use App\Models\SSFPerson;

class PersonController extends Controller
{
    public function create(){
        $request_payload = request()->all();
        $validator = Validator::make(
            $request_payload,
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

        $issf_core_id = HelperController::createCoreRecord($request_payload);

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
        return [
            ...$person->toArray(),
            'geoscope' => HelperController::get_geoscope(
                $person->core->geographic_scope_type,
                $person->issf_core_id
            ),
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
}
