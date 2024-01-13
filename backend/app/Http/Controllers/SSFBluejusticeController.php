<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $ecosystem_type_list = HelperController::formulate_list(config('constants.BLUEJUSTICE_ECOSYSTEM_TYPES'), $bluejustice, 'key', null);
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


    public function update_basic(SSFBluejustice $record) {
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'ssf_name' => ['required', 'string'],
                'ssf_country' => ['required', 'integer'],
                'ssf_location' => ['required', 'string'],
                'ssf_main_species' => ['string', 'nullable']
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


    public function update_files_info(SSFBluejustice $record) {
        $payload = request()->all();
        $rules = [];
        if($payload['image_action'] !== config('constants.IMAGE_ACTIONS.KEEP_IMAGE_KEY')){
            $rules['image_file'] = ['required_with:date_of_photo,photo_location,photographer', 'image', 'nullable'];
        }

        $validator = Validator::make($payload, $rules);
        if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $payload['uploaded_img'] = $record->uploaded_img;
        $image_action = $payload['image_action'];
        $image_file = $payload['image_file'];

        unset($payload['image_action']);
        unset($payload['image_file']);

        if($image_file && $image_action === config('constants.IMAGE_ACTIONS.UPLOAD_IMAGE_KEY')){
            if($record->uploaded_img){
                Storage::disk('bluejustice_images')->delete($record->uploaded_img);
            }

            $image_name = time() . '-' . uniqid() . '-' . $image_file->getClientOriginalName();
            Storage::disk('bluejustice_images')->put($image_name, file_get_contents($image_file));
            $payload['uploaded_img'] = $image_name;
        }

        else if(!$image_file && $image_action === config('constants.IMAGE_ACTIONS.REMOVE_IMAGE_KEY')){
            Storage::disk('bluejustice_images')->delete($record->uploaded_img);
            $payload['uploaded_img'] = null;
        }

        $formatted_payload = [];
        foreach(array_keys($payload) as $key) {
            $formatted_payload[$key] = $payload[$key];
        }
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


    public function update_general_info(SSFBluejustice $record) {
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'ssf_terms_fisheries' => [ 'in:,' . implode(',', array_values(config('constants.DEFINED_ANSWERS')))],
                'ssf_terms_fisheries_definiton' =>  ['required_if:ssf_terms_fisheries,' . config("constants.DEFINED_ANSWERS['YES']"), 'string', 'nullable']
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


    public function update_social_issues(SSFBluejustice $record) {
        $payload = request()->all();
        $validator = Validator::make(
            $payload,
            [
                'background_about_ssf' => ['string', 'nullable'],
                'justice_in_context' => ['string', 'nullable'],
                'dealing_with_justice' => ['string', 'nullable'],
                'social_justice_source' => ['string', 'nullable'],
                'types_of_justice_distributive' => ['string', 'nullable'],
                'types_of_justice_social' => ['string', 'nullable'],
                'types_of_justice_economic' => ['string', 'nullable'],
                'types_of_justice_market' => ['string', 'nullable'],
                'types_of_justice_infrastructure' => ['string', 'nullable'],
                'types_of_justice_regulatory' => ['string', 'nullable'],
                'types_of_justice_procedural' => ['string', 'nullable'],
                'types_of_justice_environmental' => ['string', 'nullable'],
                'covid_19_related' => ['string', 'nullable'],
                'types_of_justice_others' => ['string', 'nullable']
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
