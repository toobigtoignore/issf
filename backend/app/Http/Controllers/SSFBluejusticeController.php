<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\HelperController;
use App\Models\ISSFCore;
use App\Models\SSFPerson;
use App\Models\SSFBluejustice;

class SSFBluejusticeController extends Controller
{
    public function create(){
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            array_merge(ValidationController::geographic_scope_rules(), [
                'basic_info.ssf_name' => ['required', 'string'],
                'basic_info.ssf_country' => ['required', 'integer'],
                'basic_info.ssf_location' => ['required', 'string'],
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

        $bluejustice_id = SSFBluejustice::latest('id')->first()->id + 1;
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

        $new_bluejustice_record = SSFBluejustice::create([
            'id' => $bluejustice_id,
            'issf_core_id' => $issf_core_id,
            'ssf_name' => $payload['basic_info']['ssf_name'],
            'ssf_country' => $payload['basic_info']['ssf_country'],
            'ssf_location' => $payload['basic_info']['ssf_location']
        ]);

        if($new_bluejustice_record){
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'record_id' => $issf_core_id
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR')
        ];
    }


    public function get_details(SSFBluejustice $bluejustice){
        $bluejustice_type_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_SSF_TYPES'), $bluejustice, 'key', 'ssf_type_other');
        $ecosystem_type_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_ECOSYSTEM_TYPES'), $bluejustice, null, null);
        $ecosystem_detailed_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_ECOSYSTEM_DETAILED'), $bluejustice, 'key', 'ecosystem_detailed_other');
        $bluejustice_terms_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_SSF_TERMS'), $bluejustice, 'key', 'ssf_terms_others');
        $main_gear_types_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_MAINGEARS_TYPE'), $bluejustice, 'key', 'main_gears_others');
        $justice_types_list = HelperController::formulate_list(config('constants.JUSTICE_TYPES'), $bluejustice, 'key', 'types_of_justice_others');

        return [
            ...$bluejustice->toArray(),
            ...HelperController::contributor_affiliation($bluejustice->core),
            'geoscope' => HelperController::get_geoscope(
                $bluejustice->core->geographic_scope_type,
                $bluejustice->issf_core_id
            ),
            'bluejustice_type_list' => $bluejustice_type_list,
            'ecosystem_type_list' => $ecosystem_type_list,
            'ecosystem_detailed_list' => $ecosystem_detailed_list,
            'bluejustice_terms_list' => $bluejustice_terms_list,
            'main_gear_types_list' => $main_gear_types_list,
            'justice_types_list' => $justice_types_list
        ];
    }
}
