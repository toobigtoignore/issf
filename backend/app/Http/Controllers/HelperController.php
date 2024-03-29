<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Country;
use App\Models\ISSFCore;
use App\Models\GSLocal;
use App\Models\GSSubnation;
use App\Models\GSNational;
use App\Models\GSRegion;
use App\Models\Language;
use App\Models\PublicationType;
use App\Models\Region;
use App\Models\RegionCountry;
use App\Models\SelectedThemeIssue;
use App\Models\SelectedAttribute;
use App\Models\Species;
use App\Models\ExternalLink;
use App\Models\SSFPerson;
use App\Models\SSFSota;
use App\Models\SSFProfile;
use App\Models\SSFOrganization;
use App\Models\SSFCaseStudy;
use App\Models\SSFBluejustice;
use App\Models\SSFGuideline;
use App\Models\PersonOrganization;
use App\Models\ProfileOrganization;
use App\Models\UserProfile;

class HelperController extends Controller
{
    public static function build_record_summary($request){
        $record_types = config('constants.RECORD_TYPES');

        switch($request['basic_info']['record_type']){
            case $record_types['WHO']: {
                $user = UserProfile::find($request['basic_info']['contributor_id']);
                $country_name = $organization_name = '';

                if(isset($user->country->short_name)) $country_name = $user->country->short_name;
                if(isset($request['organization_core_id'])){
                    $organization = SSFOrganization::find($request['organization_core_id']);
                    if($organization) $organization_name = $organization->organization_name;
                }
                else if (isset($request['affiliation'])) $organization_name = $request['affiliation'];

                $summary = "<strong>Name: </strong>" . $user->first_name. ' ' . $user->initial . ' ' . $user->last_name .
                           "<strong>Primary Affiliation: </strong>" . $organization_name .
                           "<strong>Country of Residence: </strong>" . $country_name;

                return $summary;
            }

            case $record_types['SOTA']: {
                $publication_type = $request['basic_info']['other_publication_type'];
                if($publication_type !== ''){
                    $publication_type = PublicationType::find($request['basic_info']['publication_type_id'])->publication_type;
                }

                $summary = "<strong>Author: </strong>" . $request['basic_info']['author_names'] .
                           "<strong>Address: </strong>" . $request['basic_info']['level1_title'] . '; ' . $request['basic_info']['level2_title'] .
                           "<strong>Year: </strong>" . $request['basic_info']['year'] .
                           "<strong>Publication Type: </strong>" . $publication_type;

                return $summary;
            }

            case $record_types['PROFILE']: {
                $end_year = $request['basic_info']['end_year'];
                if($end_year == 0) $end_timeframe = ' - Ongoing';
                else if($end_year != 0 && !is_null($end_year)) $end_timeframe = ' - ' . $end_year;
                else $end_timeframe = '';

                $summary = "<strong>Fishery name: </strong>" . $request['basic_info']['ssf_name'] .
                           "<strong>Timeframe: </strong>" . $request['basic_info']['start_year'] . $end_timeframe;

                return $summary;
            }

            case $record_types['ORGANIZATION']: {
                $country = Country::find($request['basic_info']['country_id'])->short_name;
                $summary = "<strong>Organization name: </strong>" . $request['basic_info']['organization_name'] .
                           "<strong>Established in: </strong>" . $request['basic_info']['year_established'] .
                           "<strong>Country: </strong>" . $country;

                return $summary;
            }

            case $record_types['CASESTUDY']: {
                $summary = "<strong>Name: </strong>" . $request['basic_info']['name'] .
                           "<strong>Role: </strong>" . $request['basic_info']['role'];

                return $summary;
            }

            case $record_types['BLUEJUSTICE']: {
                $country = Country::find($request['basic_info']['ssf_country'])->short_name;
                $summary = "<strong>Name: </strong>" . $request['basic_info']['ssf_name'] .
                           "<strong>Country: </strong>" . $country;

                return $summary;
            }

            case $record_types['GUIDELINES']: {
                $start_time = $request['basic_info']['start_month'] . ', ' . $request['basic_info']['start_year'];
                if($request['basic_info']['ongoing'] === 'Yes') {
                    $timeframe = $start_time . ' - Ongoing';
                }
                else {
                    $timeframe = $start_time . ' - ' . $request['basic_info']['end_month'] . ', ' . $request['basic_info']['end_year'];
                }

                $summary = "<strong>Title: </strong>" . $request['basic_info']['title'] .
                           "<strong>Timeframe: </strong>" . $timeframe;

                return $summary;
            }

            default: return;
        }
    }


    public static function contributor_affiliation($core_record){
        $person_link = $contributor_affiliation = '';
        $issf_core = ISSFCore::where('core_record_type', config('constants.RECORD_TYPES.WHO'))
                            ->where('contributor_id', $core_record->contributor_id)
                            ->first();

        if($issf_core) {
            $person_link = '/details/who/' . $issf_core->issf_core_id;
            $contributor_affiliation = SSFPerson::where('issf_core_id', $issf_core->issf_core_id)->first()->affiliation;
        }

        return [
            'person_link' => $person_link,
            'contributor_affiliation' => $contributor_affiliation
        ];
    }


    public static function create_core_record($request){
        $issf_core_id = ISSFCore::latest('issf_core_id')->first()->issf_core_id + 1;
        $editor_id = $request['basic_info']['contributor_id'];

        if(isset($request['basic_info']['editor_id'])){
            $editor_id = $request['basic_info']['editor_id'];
        }

        $core_record = ISSFCore::create([
            'issf_core_id' => $issf_core_id,
            'contributor_id' => $request['basic_info']['contributor_id'],
            'core_record_type' => $request['basic_info']['record_type'],
            'core_record_summary' => self::build_record_summary($request),
            'geographic_scope_type' => $request['basic_info']['geographic_scope_type'],
            'editor_id' => $editor_id
        ]);

        if(!$core_record) {
            return false;
        }

        Cache::forget('map-records');
        Cache::forget('records-number-by-country');
        return $issf_core_id;
    }


    public static function create_geo_scope($payload, $issf_core_id){
        $geo_scope_type = isset($payload['basic_info'])
                            ? $payload['basic_info']['geographic_scope_type']
                            : $payload['geographic_scope_type'];

        switch($geo_scope_type){
            case config('constants.GEO_SCOPES.GLOBAL'):
            case config('constants.GEO_SCOPES.NS'):
                return true;

            case config('constants.GEO_SCOPES.LOCAL'): {
                foreach($payload['geo_scope']['gs_local_list'] as $local){
                    $area_point = isset($local['area_point'])
                                    ? \DB::raw("GeomFromText('POINT(" . $local['area_point']['long'] . ' ' . $local['area_point']['lat'] . ")')")
                                    : null;

                    GSLocal::create([
                        'issf_core_id' => $issf_core_id,
                        'area_name' => $local['area_name'],
                        'alternate_name' => $local['alternate_name'],
                        'country_id' => $local['country_id'],
                        'setting' => $local['setting'],
                        'setting_other' => $local['setting_other'],
                        'area_point' => $area_point
                    ]);
                }
                return true;
            }

            case config('constants.GEO_SCOPES.SUBNATIONAL'): {
                foreach($payload['geo_scope']['gs_subnation_list'] as $subnation){
                    $subnation_point = isset($subnation['subnation_point'])
                                    ? \DB::raw("GeomFromText('POINT(" . $subnation['subnation_point']['long'] . ' ' . $subnation['subnation_point']['lat'] . ")')")
                                    : null;
                    GSSubnation::create([
                        'issf_core_id' => $issf_core_id,
                        'name' => $subnation['name'],
                        'country_id' => $subnation['country_id'],
                        'type' => $subnation['type'],
                        'type_other' => $subnation['type_other'],
                        'subnation_point' => $subnation_point
                    ]);
                }
                return true;
            }

            case config('constants.GEO_SCOPES.NATIONAL'): {
                GSNational::create([
                    'issf_core_id' => $issf_core_id,
                    'country_id' => $payload['geo_scope']['gs_nation']
                ]);
                return true;
            }

            case config('constants.GEO_SCOPES.REGIONAL'): {
                foreach($payload['geo_scope']['gs_region_list'] as $region){
                    $gs_region = GSRegion::create([
                        'issf_core_id' => $issf_core_id,
                        'region_name_other' => $region['region_name_other'],
                        'region_id' => $region['region_id']
                    ]);
                    foreach($region['countries'] as $country_id){
                        RegionCountry::create([
                            'region_id' => $gs_region->id,
                            'country_id' => $country_id
                        ]);
                    }
                }
                return true;
            }

            default: break;
        }

        return false;
    }


    public static function delete_detail_record($issf_core_id, $core_record_type){
        switch($core_record_type){
            case config('constants.RECORD_TYPES.WHO'): {
                SSFPerson::where('issf_core_id', $issf_core_id)->delete();
                ExternalLink::where('issf_core_id', $issf_core_id)->delete();
                PersonOrganization::where('ssfperson_id', $issf_core_id)->delete();
                SelectedThemeIssue::where('issf_core_id', $issf_core_id)->delete();
                Species::where('issf_core_id', $issf_core_id)->delete();
                break;
            }
            case config('constants.RECORD_TYPES.SOTA'): {
                SSFSota::where('issf_core_id', $issf_core_id)->delete();
                ExternalLink::where('issf_core_id', $issf_core_id)->delete();
                SelectedAttribute::where('issf_core_id', $issf_core_id)->delete();
                SelectedThemeIssue::where('issf_core_id', $issf_core_id)->delete();
                Species::where('issf_core_id', $issf_core_id)->delete();
                break;
            }
            case config('constants.RECORD_TYPES.PROFILE'): {
                SSFProfile::where('issf_core_id', $issf_core_id)->delete();
                ExternalLink::where('issf_core_id', $issf_core_id)->delete();
                ProfileOrganization::where('ssfprofile_id', $issf_core_id)->delete();
                SelectedAttribute::where('issf_core_id', $issf_core_id)->delete();
                Species::where('issf_core_id', $issf_core_id)->delete();
                break;
            }
            case config('constants.RECORD_TYPES.ORGANIZATION'): {
                SSFOrganization::where('issf_core_id', $issf_core_id)->delete();
                ExternalLink::where('issf_core_id', $issf_core_id)->delete();
                SelectedThemeIssue::where('issf_core_id', $issf_core_id)->delete();
                break;
            }
            case config('constants.RECORD_TYPES.CASESTUDY'): SSFCaseStudy::where('issf_core_id', $issf_core_id)->delete(); break;
            case config('constants.RECORD_TYPES.BLUEJUSTICE'): SSFBluejustice::where('issf_core_id', $issf_core_id)->delete(); break;
            case config('constants.RECORD_TYPES.GUIDELINES'): SSFGuideline::where('issf_core_id', $issf_core_id)->delete(); break;
            default: break;
        }
    }


    public static function delete_gs_scope($issf_core_id, $geographic_scope_type){
        switch($geographic_scope_type){
            case config('constants.GEO_SCOPES.LOCAL'): $geo_scopes = GSLocal::where('issf_core_id', $issf_core_id)->get(); break;
            case config('constants.GEO_SCOPES.SUBNATIONAL'): $geo_scopes = GSSubnation::where('issf_core_id', $issf_core_id)->get(); break;
            case config('constants.GEO_SCOPES.NATIONAL'): $geo_scopes = GSNational::where('issf_core_id', $issf_core_id)->get(); break;
            case config('constants.GEO_SCOPES.REGIONAL'): $geo_scopes = GSRegion::where('issf_core_id', $issf_core_id)->get(); break;
            default: return;
        }

        foreach($geo_scopes as $gs) {
            if($geographic_scope_type === config('constants.GEO_SCOPES.REGIONAL')){
                RegionCountry::where('region_id', $gs->id)->first()->delete();
            }
            $gs->delete();
        }
    }


    public static function delete_record(ISSFCore $record){
        $issf_core_id = $record->issf_core_id;
        $record_type = $record->core_record_type;

        self::delete_gs_scope($issf_core_id, $record->geographic_scope_type);
        self::delete_detail_record($issf_core_id, $record_type);

        $record->delete();

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public static function formulate_list($constant_list, $record, $truthy_value, $other_key){
        $is_truthy_key = $truthy_value === 'key';
        $result_list = [];
        $list_keys = array_keys($constant_list);

        foreach($list_keys as $key){
            if($is_truthy_key && ($truthy_value !== '' || !$truthy_value)) $truthy_value = $record[$key];
            if($record[$key] && $record[$key] === $truthy_value) array_push($result_list, $constant_list[$key]);
            if($is_truthy_key) $truthy_value = 'key';
        }

        if($record[$other_key] && $record[$other_key] !== '' ) array_push($result_list, $record[$other_key]);
        return $result_list;
    }


    public static function get_all_contributions(){
        return Cache::rememberForever('map-records', function () {
            $issf_records = ISSFCore::all();
            $results = [];

            foreach($issf_records as $record){
                $contributor = UserProfile::find($record->contributor_id);
                $contributor_name = $contributor->first_name . ' ' . $contributor->last_name;
                $coordinates = null;

                switch($record->geographic_scope_type){
                    case config('constants.GEO_SCOPES.LOCAL'): {
                        $point = GSLocal::where('issf_core_id', $record->issf_core_id)->get(['area_point', 'country_id'])->first();
                        if($point) {
                            $countries = [$point->country->short_name];
                            $coordinates = $point->area_point;
                        }
                        break;
                    }

                    case config('constants.GEO_SCOPES.SUBNATIONAL'): {
                        $point = GSSubnation::where('issf_core_id', $record->issf_core_id)->get(['subnation_point', 'country_id'])->first();
                        if($point) {
                            $countries = [$point->country->short_name];
                            $coordinates = $point->subnation_point;
                        }
                        break;
                    }

                    case config('constants.GEO_SCOPES.NATIONAL'): {
                        $national = GSNational::where('issf_core_id', $record->issf_core_id)->first();
                        $countries = [$national->country->short_name];
                        $coordinates = Country::find($national->country_id)->country_point;
                        break;
                    }

                    case config('constants.GEO_SCOPES.REGIONAL'): {
                        $region = GSRegion::where('issf_core_id', $record->issf_core_id)->first();
                        $countries = $region->countries->map(fn($country) => Country::find($country->country_id)->short_name);
                        $coordinates = Region::find($region->region_id)->region_point;
                        break;
                    }

                    default: break;
                }

                if(empty($contributor_name)) $contributor_name = $contributor->username;
                $results[$record->issf_core_id] = [
                    'issf_core_id' => $record->issf_core_id,
                    'core_record_type' => $record->core_record_type,
                    'core_record_summary' => $record->core_record_summary,
                    'contributor_name' => $contributor_name,
                    'geographic_scope_type' => $record->geographic_scope_type,
                    'contribution_date' => $record->contribution_date,
                    'countries' => $countries,
                    'point' => $coordinates
                ];
            };

            return $results;
        });
    }


    public static function get_country_name(Country $country){
        return $country->short_name;
    }


    public static function get_external_links($issf_core_id){
        return ExternalLink::where('issf_core_id', $issf_core_id)
                            ->get(['link_type', 'link_address']);
    }


    public static function get_geoscope($scope_type, $issf_core_id){
        switch($scope_type){
            case config('constants.GEO_SCOPES.GLOBAL'):
            case config('constants.GEO_SCOPES.NS'):
                return $scope_type;

            case config('constants.GEO_SCOPES.LOCAL'): return GSLocal::where('issf_core_id', $issf_core_id)->get();
            case config('constants.GEO_SCOPES.SUBNATIONAL'): return GSSubnation::where('issf_core_id', $issf_core_id)->get();
            case config('constants.GEO_SCOPES.NATIONAL'): return GSNational::where('issf_core_id', $issf_core_id)->get();
            case config('constants.GEO_SCOPES.REGIONAL'): return GSRegion::where('issf_core_id', $issf_core_id)->get();
            default: break;
        }
    }


    public function get_record_by_country(){
        return Cache::rememberForever('records-number-by-country', function () {
            $countries = Country::all();
            $record_types = config('constants.RECORD_TYPES');
            $record_keys = array_map(
                'strtolower',
                array_keys($record_types)
            );
            $results = [];

            foreach($countries as $country){
                $record_counts = [];
                foreach($record_keys as $key) {
                    $record_counts[$key] = 0;
                }

                $issf_core_ids = collect(array_merge(
                    GSLocal::where('country_id', $country->country_id)->without('country')->get(['issf_core_id'])->toArray(),
                    GSSubnation::where('country_id', $country->country_id)->without('country')->get(['issf_core_id'])->toArray(),
                    GSNational::where('country_id', $country->country_id)->without('country')->get(['issf_core_id'])->toArray()
                ));
                $unique_ids = $issf_core_ids->unique('issf_core_id');
                $country_records = ISSFCore::whereIn('issf_core_id', $unique_ids)->get(['core_record_type']);

                foreach($country_records as $cr){
                    $record_counts[
                        strtolower(array_search(
                            $cr['core_record_type'], $record_types
                        ))
                    ] += 1;
                }

                array_push($results, [
                    'country' => $country->short_name,
                    ...$record_counts
                ]);
            }

            return $results;
        });
    }


    public static function get_all_organizations(){
        return SSFOrganization::without('core', 'organization_country')->get(['issf_core_id', 'organization_name']);
    }


    public static function get_attributes($issf_core_id){
        $categories = $values = [];
        $attributes = SelectedAttribute::where('issf_core_id', $issf_core_id)->get();

        if($attributes->count() === 0) return null;

        foreach($attributes as $attr) {
            $attr_category = $attr->category->attribute_label;
            $attr_value = [
                'value' => $attr->value,
                'unit' => null,
                'additional' => null
            ];

            if($attr->other_value) $attr_value['value'] = $attr->other_value;
            else if($attr->label) $attr_value['value'] = $attr->label->value_label;

            if($attr->category->units_label) $attr_value['unit'] = $attr->category->units_label;
            if($attr->additional) $attr_value['additional'] = $attr->additional;

            $category_index = array_search($attr_category, $categories);

            if($category_index === false){
                array_push($categories, $attr_category);
                $indexForValue = sizeof($categories) - 1;
                if(sizeof($values) > $indexForValue){
                    array_push($values[$indexForValue], $attr_value);
                }
                else array_push($values, array($attr_value));
            }

            else{
                array_push(
                    $values[$category_index],
                    $attr_value
                );
            }
        }

        return [
            'categories' => $categories,
            'values' => $values
        ];
    }


    public static function get_languages(){
        return Language::all();
    }


    public static function get_species($issf_core_id){
        return Species::where('issf_core_id', $issf_core_id)
                        ->get(['species_scientific', 'species_common']);
    }


    public static function get_theme_issues($issf_core_id){
        $economic = $ecological = $social = $governance = [];
        $selected_theme_issues = SelectedThemeIssue::where('issf_core_id', $issf_core_id)->get();
        $categories = config('constants.THEME_ISSUES_CATEGORY');
        foreach($selected_theme_issues as $sti){
            $value = $sti->theme_issue_values->label;
            $category = $sti->theme_issue_values->category->category;

            if(strtolower($value) === 'other'){
                $value = $sti->other_theme_issue;
            }

            switch($category){
                case $categories['ECONOMIC']: array_push($economic, $value); break;
                case $categories['ECOLOGICAL']: array_push($ecological, $value); break;
                case $categories['SOCIAL']: array_push($social, $value); break;
                case $categories['GOVERNANCE']: array_push($governance, $value); break;
            }
        }

        return [
            $categories['ECONOMIC'] => $economic,
            $categories['ECOLOGICAL'] => $ecological,
            $categories['SOCIAL'] => $social,
            $categories['GOVERNANCE'] => $governance
        ];
    }


    public static function get_users_contributions($contributor_id){
        $contributor_data = ISSFCore::where('contributor_id', $contributor_id)
                                    ->where('editor_id', '!=', $contributor_id)
                                    ->get();

        $editor_data = ISSFCore::where('editor_id', $contributor_id)
                                ->where('contributor_id', '!=', $contributor_id)
                                ->get();

        return [
            'contributor_data' => $contributor_data,
            'editor_data' => $editor_data
        ];
    }


    public static function update_characteristics($issf_core_id){
        $payload = request()->all();
        $theme_issues = SelectedAttribute::where('issf_core_id', $issf_core_id)->delete();

        foreach($payload as $entry) {
            SelectedAttribute::create([
                'attribute_id' => $entry['attribute_id'],
                'attribute_value_id' => $entry['attribute_value_id'],
                'other_value' => $entry['other_value'],
                'value' => $entry['value'],
                'additional' => $entry['additional'],
                'issf_core_id' => $issf_core_id
            ]);
        };

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public static function update_geoscope($issf_core_id){
        $payload = request()->all();
        $core_record = ISSFCore::find($issf_core_id);

        switch($core_record->geographic_scope_type){
            case config('constants.GEO_SCOPES.LOCAL'): GSLocal::where('issf_core_id', $issf_core_id)->delete(); break;
            case config('constants.GEO_SCOPES.SUBNATIONAL'): GSSubnation::where('issf_core_id', $issf_core_id)->delete(); break;
            case config('constants.GEO_SCOPES.NATIONAL'): GSNational::where('issf_core_id', $issf_core_id)->delete(); break;
            case config('constants.GEO_SCOPES.REGIONAL'): {
                $gs_regions = GSRegion::where('issf_core_id', $issf_core_id);
                foreach($gs_regions->get() as $region){
                    RegionCountry::where('region_id', $region->id)->delete();
                }
                $gs_regions->delete();
                break;
            }
            default: break;
        }

        self::create_geo_scope($payload, $issf_core_id);

        $core_record->geographic_scope_type = $payload['geographic_scope_type'];
        $core_record->save();

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public static function update_external_link($issf_core_id){
        $payload = request()->all();
        $links = ExternalLink::where('issf_core_id', $issf_core_id);

        if($links->count() === 0 && sizeof($payload) === 0){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'message' => 'All fields are empty.'
            ];
        }

        $links->delete();

        foreach($payload as $entry) {
            ExternalLink::create([
                'link_type' => $entry['link_type'],
                'link_address' => $entry['link_address'],
                'issf_core_id' => $issf_core_id
            ]);
        };

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public static function update_species($issf_core_id){
        $payload = request()->all();
        $species = Species::where('issf_core_id', $issf_core_id);

        if($species->count() === 0 && sizeof($payload) === 0){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'message' => 'All fields are empty.'
            ];
        }

        $species->delete();

        foreach($payload as $entry) {
            Species::create([
                'species_common' => $entry['species_common'],
                'species_scientific' => $entry['species_scientific'],
                'issf_core_id' => $issf_core_id
            ]);
        };

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }


    public static function update_record_summary($record_type, $issf_core_id, $payload){
        $record_types = config('constants.RECORD_TYPES');

        switch($record_type){
            case $record_types['WHO']: {
                $initials = $payload['initials'] ?: '';
                $updated_name = $payload['first_name'] . ' ' . $initials . ' ' . $payload['last_name'];
                $summary = "<strong>Name: </strong>" . $updated_name .
                           "<strong>Primary Affiliation: </strong>" . $payload['affiliation'] .
                           "<strong>Country of Residence: </strong>" . $payload['country'];
                break;
            }

            case $record_types['SOTA']: {
                $address = $payload['level1_title'] . '; ' . $payload['level2_title'];
                $summary = "<strong>Author: </strong>" . $payload['author_names'] .
                           "<strong>Address: </strong>" . $address  .
                           "<strong>Year: </strong>" . $payload['year'] .
                           "<strong>Publication Type: </strong>" . $payload['publication_type'];
                break;
            }

            case $record_types['PROFILE']: {
                if($payload['ongoing'] || $payload['end_year'] == 0) $end_timeframe =  '- Ongoing';
                else if(!is_null($payload['end_year']) && $payload['end_year'] != 0) $end_timeframe =  ' - ' . $payload['end_year'];
                else $end_timeframe = '';
                $summary = "<strong>Fishery name: </strong>" . $payload['ssf_name'] .
                           "<strong>Timeframe: </strong>" . $payload['start_year'] . $end_timeframe;
                break;
            }

            case $record_types['ORGANIZATION']: {
                $country = Country::find($payload['country_id'])->short_name;
                $summary = "<strong>Organization name: </strong>" . $payload['organization_name'] .
                           "<strong>Established in: </strong>" . $payload['year_established'] .
                           "<strong>Country: </strong>" . $country;
                break;
            }

            case $record_types['CASESTUDY']: {
                $summary = "<strong>Name: </strong>" . $payload['name'] . "<strong>Role: </strong>" . $payload['role'];
                break;
            }

            case $record_types['BLUEJUSTICE']: {
                $country = Country::find($payload['ssf_country'])->short_name;
                $summary = "<strong>Name: </strong>" . $payload['ssf_name'] . "<strong>Country: </strong>" . $country;
                break;
            }

            case $record_types['GUIDELINES']: {
                $start_time = $payload['start_month'] . ', ' . $payload['start_year'];
                if($payload['ongoing'] === 'Yes') $timeframe = $start_time . ' - Ongoing';
                else $timeframe = $start_time . ' - ' . $payload['end_month'] . ', ' . $payload['end_year'];
                $summary = "<strong>Title: </strong>" . $payload['title'] . "<strong>Timeframe: </strong>" . $timeframe;
                break;
            }

            default: break;
        }

        $core_record = ISSFCore::find($issf_core_id);
        $core_record->core_record_summary = $summary;
        $update_core_summary = $core_record->save();
        if($update_core_summary){
            $cached_records = Cache::get('map-records');
            $cached_records[$issf_core_id]['core_record_summary'] = $summary;
            Cache::set('map-records', $cached_records);
        }
    }


    public static function update_theme_issues($issf_core_id){
        $payload = request()->all();
        $theme_issues = SelectedThemeIssue::where('issf_core_id', $issf_core_id)->delete();

        foreach($payload as $entry) {
            SelectedThemeIssue::create([
                'theme_issue_value_id' => $entry['theme_issue_id'],
                'other_theme_issue' => $entry['other_value'],
                'issf_core_id' => $issf_core_id
            ]);
        };

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS')
        ];
    }
}
