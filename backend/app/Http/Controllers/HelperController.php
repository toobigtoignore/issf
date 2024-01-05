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
                $organization_name = '';
                if(isset($request['organization_core_id'])){
                    $organization = SSFOrganization::find($request['organization_core_id']);
                    if($organization) $organization_name = $organization->organization_name;
                }
                else if (isset($request['affiliation'])) $organization_name = $request['affiliation'];

                $summary = "<strong>Name: </strong>" . $user->first_name. ' ' . $user->initial . ' ' . $user->last_name .
                           "<strong>Primary Affiliation: </strong>" . $organization_name .
                           "<strong>Country of Residence: </strong>" . $user->country->short_name;

                return $summary;
            }

            case $record_types['SOTA']: {
                $publication_type = $request['basic_info']['other_publication_type'];
                if($publication_type !== ''){
                    $publication_type = PublicationType::find($request['basic_info']['publication_type_id'])->publication_type;
                }

                $summary = "<strong>Author: </strong>" . $request['basic_info']['author_names'] .
                           "<strong>Title: </strong>" . $request['basic_info']['level1_title'] . '; ' . $request['basic_info']['level2_title'] .
                           "<strong>Year: </strong>" . $request['basic_info']['year'] .
                           "<strong>Publication Type: </strong>" . $publication_type;

                return $summary;
            }

            case $record_types['PROFILE']: {
                $end_timeframe = $request['basic_info']['end_year'] ?: 'Ongoing';
                $summary = "<strong>Fishery name: </strong>" . $request['basic_info']['ssf_name'] .
                           "<strong>Timeframe: </strong>" . $request['basic_info']['start_year'] . ' - ' . $end_timeframe .
                           "<strong>Percent completed: </strong>" . 10;

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


    public static function createCoreRecord($request){
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

        Cache::forget('records-number-by-country');
        return $issf_core_id;
    }


    public static function createGeoscope($request, $issf_core_id){
        switch($request['basic_info']['geographic_scope_type']){
            case config('constants.GEO_SCOPES.GLOBAL'):
            case config('constants.GEO_SCOPES.NS'):
                return true;

            case config('constants.GEO_SCOPES.LOCAL'): {
                foreach($request['geo_scope']['gs_local_list'] as $local){
                    GSLocal::create([
                        'issf_core_id' => $issf_core_id,
                        'area_name' => $local['area_name'],
                        'alternate_name' => $local['alternate_name'],
                        'country_id' => $local['country_id'],
                        'setting' => $local['setting'],
                        'setting_other' => $local['setting_other'],
                        'area_point' => \DB::raw("GeomFromText('POINT(" . $local['area_point']['long'] . ' ' . $local['area_point']['lat'] . ")')")
                    ]);
                }
                Cache::forget('map-records');
                return true;
            }

            case config('constants.GEO_SCOPES.SUBNATIONAL'): {
                foreach($request['geo_scope']['gs_subnation_list'] as $subnation){
                    GSSubnation::create([
                        'issf_core_id' => $issf_core_id,
                        'name' => $subnation['name'],
                        'country_id' => $subnation['country_id'],
                        'type' => $subnation['type'],
                        'type_other' => $subnation['type_other'],
                        'subnation_point' => \DB::raw("GeomFromText('POINT(" . $subnation['subnation_point']['long'] . ' ' . $subnation['subnation_point']['lat'] . ")')")
                    ]);
                }
                Cache::forget('map-records');
                return true;
            }

            case config('constants.GEO_SCOPES.NATIONAL'): {
                GSNational::create([
                    'issf_core_id' => $issf_core_id,
                    'country_id' => $request['geo_scope']['gs_nation']
                ]);
                Cache::forget('map-records');
                return true;
            }

            case config('constants.GEO_SCOPES.REGIONAL'): {
                foreach($request['geo_scope']['gs_region_list'] as $region){
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
                Cache::forget('map-records');
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
                array_push($results, [
                    'issf_core_id' => $record->issf_core_id,
                    'core_record_type' => $record->core_record_type,
                    'core_record_summary' => $record->core_record_summary,
                    'contributor_name' => $contributor_name,
                    'geographic_scope_type' => $record->geographic_scope_type,
                    'contribution_date' => $record->contribution_date,
                    'countries' => $countries,
                    'point' => $coordinates
                ]);
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


    public static function get_attributes($issf_core_id){
        $categories = $values = [];
        $attributes = SelectedAttribute::where('issf_core_id', $issf_core_id)->get();

        foreach($attributes as $attr) {
            $attr_category = $attr->category->attribute_label;
            $attr_value = $attr->value;

            if($attr->other_value) $attr_value = $attr->other_value;
            else if($attr->label) $attr_value = $attr->label->value_label;
            $attr_value .= ' ' . $attr->category->units_label;

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


    public static function get_species($issf_core_id){
        return Species::where('issf_core_id', $issf_core_id)
                        ->get(['species_scientific', 'species_common']);
    }


    public static function get_theme_issues($issf_core_id){
        $economic = $ecological = $social = $governance = [];
        $selectedThemeIssues = SelectedThemeIssue::where('issf_core_id', $issf_core_id)->get();
        $categories = config('constants.THEME_ISSUES_CATEGORY');

        foreach($selectedThemeIssues as $sti){
            $value = $sti->theme_issue_values->label;
            $category = $sti->theme_issue_values->category->category;

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
}
