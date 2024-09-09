<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Country;
use App\Models\ISSFCore;
use App\Models\GSLocal;
use App\Models\GSSubnation;
use App\Models\GSNational;
use App\Models\GSRegion;
use App\Models\SSFPerson;
use App\Models\SSFSota;
use App\Models\SSFOrganization;
use App\Models\SSFBluejustice;
use App\Models\RegionCountry;

class VisualizationController extends Controller
{
    public static function removeCountriesWithFewRecords($results, $min_result_number) {
        $countryCount = [];
        $filteredArray = [];

        foreach ($results as $row) {
            if (isset($countryCount[$row['country']])) {
                $countryCount[$row['country']]++;
            } else {
                $countryCount[$row['country']] = 1;
            }
        }

        foreach ($results as $row) {
            if ($countryCount[$row['country']] > $min_result_number) {
                $filteredArray[] = $row;
            }
        }

        return $filteredArray;
    }


    public static function removeCountriesWithFewBluejusticeRecords($results, $min_result_number) {
        $countryCount = [];
        $filteredArray = [];

        $keys = array_slice(array_keys($results[0]->toArray()), 3);

        foreach($results as $row) {
            if (!isset($countryCount[$row['ssf_country']])) {
                $countryCount[$row['ssf_country']] = 0;
            }
            foreach($keys as $key){
                if($row[$key] !== null && $row[$key] !== ''){
                    $countryCount[$row['ssf_country']]++;
                }
            }
        }

        foreach ($results as $row) {
            if ($countryCount[$row['ssf_country']] > $min_result_number) {
                $filteredArray[] = $row;
            }
        }

        return $filteredArray;
    }


    public static function get_bluejustice_data(){
        return Cache::rememberForever('bluejustice-visualization-data', function () {
            $filteredRows = [];
            $rows = ISSFCore::join('ssf_bluejustice', 'issf_core.issf_core_id', '=', 'ssf_bluejustice.issf_core_id')
                            ->join('country', 'ssf_bluejustice.ssf_country', '=', 'country.country_id')
                            ->select('issf_core.geographic_scope_type', 'ssf_bluejustice.issf_core_id', 'country.short_name as ssf_country', 'ssf_bluejustice.types_of_justice_distributive as Distributive justice', 'ssf_bluejustice.types_of_justice_social as Social justice', 'ssf_bluejustice.types_of_justice_economic as Economic justice', 'ssf_bluejustice.types_of_justice_market as Market justice', 'ssf_bluejustice.types_of_justice_infrastructure as Infrastructure/wellbeing justice', 'ssf_bluejustice.types_of_justice_regulatory as Regulatory justice', 'ssf_bluejustice.types_of_justice_procedural as Procedural justice', 'ssf_bluejustice.types_of_justice_environmental as Environmental justice', 'ssf_bluejustice.covid_19_related as COVID-19 related', 'ssf_bluejustice.types_of_justice_others as Others')
                            ->where('issf_core.core_record_type', 'SSF Blue Justice')
                            ->without('contributor')
                            ->get();

            foreach($rows as $row){
                if(
                    ($row['Distributive justice'] !== null && $row['Distributive justice'] !== '') ||
                    ($row['Social justice'] !== null && $row['Social justice'] !== '') ||
                    ($row['Economic justice'] !== null && $row['Economic justice'] !== '') ||
                    ($row['Market justice'] !== null && $row['Market justice'] !== '') ||
                    ($row['Infrastructure/wellbeing justice'] !== null && $row['Infrastructure/wellbeing justice'] !== '') ||
                    ($row['Regulatory justice'] !== null && $row['Regulatory justice'] !== '') ||
                    ($row['Procedural justice'] !== null && $row['Procedural justice'] !== '') ||
                    ($row['Environmental justice'] !== null && $row['Environmental justice'] !== '') ||
                    ($row['COVID-19 related'] !== null && $row['COVID-19 related'] !== '') ||
                    ($row['Others'] !== null && $row['Others'] !== '')
                ){
                    $filteredRows[] = $row;
                }
            }

            $filteredRows = self::removeCountriesWithFewBluejusticeRecords($filteredRows, 2);
            return $filteredRows;
        });
    }


    public static function get_governance_modes(){
        return Cache::rememberForever('governance-visualization-data', function () {
            $attributes = DB::select("SELECT SA.issf_core_id, AV.value_label FROM selected_attribute AS SA JOIN attribute_value AS AV ON SA.attribute_value_id = AV.id WHERE AV.attribute_id = 39");
            $results = [];
            foreach($attributes as $attr){
                $current_core_id = $attr->issf_core_id;
                $country_names = self::get_country_names($current_core_id);
                if($country_names){
                    foreach($country_names as $country){
                        array_push($results, array(
                            'issf_core_id' => $attr->issf_core_id,
                            'valueLabel' => $attr->value_label,
                            'country' => $country
                        ));
                    }
                }
            }
            $results = self::removeCountriesWithFewRecords($results, 3);
            return $results;
        });
    }


    public static function get_country_names($issf_core_id, $geographic_scope_type = NULL){
        if(is_null($geographic_scope_type)){
            $geographic_scope_type = ISSFCore::where('issf_core_id', $issf_core_id)->without('contributor')->first()->geographic_scope_type;
        }
        $country_id_list = $country_names = [];
        switch($geographic_scope_type){
            case config('constants.GEO_SCOPES.LOCAL'): $country_id_list = GSLocal::where('issf_core_id', $issf_core_id)->distinct('country_id')->get(['country_id']); break;
            case config('constants.GEO_SCOPES.SUBNATIONAL'): $country_id_list = GSSubnation::where('issf_core_id', $issf_core_id)->distinct('country_id')->get(['country_id']); break;
            case config('constants.GEO_SCOPES.NATIONAL'): $country_id_list = GSNational::where('issf_core_id', $issf_core_id)->distinct('country_id')->get(['country_id']); break;
            case config('constants.GEO_SCOPES.REGIONAL'): {
                $region_id_list = GSRegion::where('issf_core_id', $issf_core_id)->get('id');
                foreach($region_id_list as $region){
                    $countries = $region->countries;
                    foreach($countries as $country){
                        array_push($country_id_list, array(
                            'country_id' => $country->country_id
                        ));
                    }
                }
            }
            default: return;
        }
        if(sizeof($country_id_list) > 0){
            foreach($country_id_list as $country_id){
                $country_name = Country::where('country_id', $country_id->country_id)->get(['short_name'])->first()->short_name;
                array_push($country_names, $country_name);
            }
        }
        return $country_names;
    }


    public static function get_sota_data(){
        return Cache::rememberForever('sota-visualization-data', function () {
            $data = DB::select("SELECT IC.geographic_scope_type, STI.issf_core_id, STI.theme_issue_value_id, SSF_SOTA.year FROM selected_theme_issue AS STI JOIN ssf_sota AS SSF_SOTA ON STI.issf_core_id = SSF_SOTA.issf_core_id JOIN issf_core AS IC ON SSF_SOTA.issf_core_id = IC.issf_core_id WHERE SSF_SOTA.year >= YEAR(CURDATE()) - 20");
            $results = [];
            foreach($data as $d){
                $value = DB::select("SELECT TIC.category FROM theme_issue_values AS TIV JOIN theme_issue_categories AS TIC ON TIV.category_id = TIC.id WHERE TIV.id = " . $d->theme_issue_value_id . " LIMIT 1");
                array_push($results, array(
                    'issf_core_id' => $d->issf_core_id,
                    'year' => $d->year,
                    'geographic_scope_type' => $d->geographic_scope_type,
                    'category' => $value[0]->category
                ));
            }

            foreach($results as $key => $item){
                $issf_core_id = $item['issf_core_id'];
                $country = null;
                switch($item['geographic_scope_type']){
                    case config('constants.GEO_SCOPES.LOCAL'):
                        $country = GSLocal::where('issf_core_id', $issf_core_id)->get()->first();
                        break;
                    case config('constants.GEO_SCOPES.SUBNATIONAL'):
                        $country = GSSubnation::where('issf_core_id', $issf_core_id)->get()->first();
                        break;
                    case config('constants.GEO_SCOPES.REGIONAL'):
                        $region_info = GSRegion::where('issf_core_id', $item['issf_core_id'])->get(['id']);
                        $region_country_ids = [];
                        foreach($region_info as $ri){
                            if(sizeof($ri->countries) > 0){
                                foreach($ri->countries as $country){
                                    array_push($region_country_ids, $country->country_id);
                                }
                            }
                        }

                        $region_country_ids = array_unique($region_country_ids);
                        foreach($region_country_ids as $id){
                            array_push($results, array(
                                'issf_core_id' => $item['issf_core_id'],
                                'year' => $item['year'],
                                'geographic_scope_type' => $item['geographic_scope_type'],
                                'category' => $item['category'],
                                'country' => Country::where('country_id', $id)->get(['short_name'])->first()->short_name
                            ));
                        }
                        unset($results[$key]);
                        break;
                    case config('constants.GEO_SCOPES.NATIONAL'):
                        $country = GSNational::where('issf_core_id', $issf_core_id)->get()->first();
                        break;
                    default: {
                        break;
                    }
                }

                if($item['geographic_scope_type'] !== config('constants.GEO_SCOPES.REGIONAL')){
                    if($country){
                        $results[$key]['country'] = $country->country->short_name;
                    }
                    else {
                        unset($results[$key]);
                    }
                }
            }
            return array_values($results);
        });
    }


    public static function get_mshare_data(){
        return Cache::rememberForever('mshare-visualization-data', function () {
            $record_types = implode(",", array_map(function($type) {
                return "'" . $type . "'";
            }, [config('constants.RECORD_TYPES.SOTA'), config('constants.RECORD_TYPES.PROFILE')]));

            $records = DB::select("SELECT IC.geographic_scope_type, SA.issf_core_id, COALESCE(SA.additional, '') AS additional, AV.value_label AS market_share FROM selected_attribute AS SA JOIN attribute_value AS AV ON SA.attribute_value_id = AV.id JOIN issf_core AS IC ON SA.issf_core_id = IC.issf_core_id WHERE SA.attribute_id = 38 AND IC.core_record_type IN ($record_types)");

            foreach($records as $key => $item){
                $country_names = self::get_country_names($item->issf_core_id, $item->geographic_scope_type);
                if(is_null($country_names) || sizeof($country_names) <= 0){
                    unset($records[$key]);
                }
                else if(sizeof($country_names) == 1){
                    $records[$key]->country = $country_names[0];
                    unset($records[$key]->geographic_scope_type);
                }
                else{
                    foreach($country_names as $country){
                        array_push($records, array(
                            'issf_core_id' => $item->issf_core_id,
                            'additional' => $item->additional,
                            'market_share' => $item->market_share,
                            'country' => $country
                        ));
                    }
                    unset($records[$key]);
                }
            }
            return array_values($records);
        });
    }


    public static function get_wiw_data(){
        return Cache::rememberForever('wiw-visualization-data', function () {
            $records = SSFPerson::where('number_publications', '>', 0)->get(['issf_core_id', 'number_publications']);
            $results = [];
            foreach($records as $record){
                if(!is_null($record->core->contributor->country)){
                    $country_name = $record->core->contributor->country->short_name;
                    $region_name = $record->core->contributor->country->region->region_name;
                    if(in_array($region_name, ['Asia', 'Oceania'])){
                        $region_name = 'Asia & Oceania';
                    }
                    else if(in_array($region_name, ['Latin America', 'Caribbean'])){
                        $region_name = 'Latin America & the Caribbean';
                    }

                    if($country_name === 'United States of America'){
                        $country_name = 'USA';
                    }
                    else {
                        $position= strpos($country_name, '(');
                        if($position !== false){
                            $country_name = trim(substr($country_name, 0, $position)) ;
                        }
                    }
                    array_push($results, array(
                        'researcher_name' => $record->core->contributor->first_name . ' ' . $record->core->contributor->last_name,
                        'country_name' => $country_name,
                        'geographic_scope_type' => $record->core->geographic_scope_type,
                        'issf_core_id' => $record->issf_core_id,
                        'number_publications' => $record->number_publications,
                        'region' => $region_name
                    ));
                }
            }
            return $results;
        });
    }


    public static function get_researcher_data(){
        return Cache::rememberForever('research-visualization-data', function () {
            $records = DB::select("SELECT IC.issf_core_id, IC.geographic_scope_type, IC.core_record_type, STI.id AS selected_theme_issue_id, STI.theme_issue_value_id, TIV.category_id, TIC.category FROM selected_theme_issue AS STI JOIN theme_issue_values AS TIV ON STI.theme_issue_value_id = TIV.id JOIN theme_issue_categories AS TIC ON TIV.category_id = TIC.id JOIN issf_core AS IC ON STI.issf_core_id = IC.issf_core_id");

            foreach($records as $key => $item){
                $year = null;
                if($item->core_record_type === config('constants.RECORD_TYPES.WHO')){
                    $date = ISSFCore::where('issf_core_id', $item->issf_core_id)->first()->contribution_date;
                    $year = explode('-', $date)[0];
                }
                else if($item->core_record_type === config('constants.RECORD_TYPES.SOTA')){
                    $year = SSFSota::where('issf_core_id', $item->issf_core_id)->first()->year;
                }
                else if($item->core_record_type === config('constants.RECORD_TYPES.ORGANIZATION')){
                    $year = SSFOrganization::where('issf_core_id', $item->issf_core_id)->first()->year_established;
                }

                $item->year = $year;
                unset($records[$key]->core_record_type);

                $current_year = (int) date("Y");
                if(is_null($year) || $year < $current_year - 20){
                    unset($records[$key]);
                    continue;
                }

                $country_names = self::get_country_names($item->issf_core_id);
                if(is_null($country_names)){
                    unset($records[$key]);
                }
                else {
                    if(sizeof($country_names) <= 0){
                        unset($records[$key]);
                    }
                    else if(sizeof($country_names) == 1){
                        $item->country = $country_names[0];
                        $country_info = Country::where('short_name', $country_names[0])->first();
                        $region = $country_info->region->region_name;
                        $item->region = $region;
                    }
                    else {
                        foreach($country_names as $country){
                            $country_info = Country::where('short_name', $country)->first();
                            $region = $country_info->region->region_name;
                            array_push($records, array(
                                'issf_core_id' => $item->issf_core_id,
                                'geographic_scope_type' => $item->geographic_scope_type,
                                'selected_theme_issue_id' => $item->selected_theme_issue_id,
                                'theme_issue_value_id' => $item->theme_issue_value_id,
                                'category_id' => $item->category_id,
                                'category' => $item->category,
                                'country' => $country,
                                'region' => $region
                            ));
                            unset($records[$key]);
                        }
                    }
                }
            }
            return array_values($records);
        });
    }


    public static function get_gear_vesel_data(){
        set_time_limit(0);
        return Cache::rememberForever('gear-visualization-data', function () {
            $formatted = $results = [];
            $gear_key = 'Main gear type(s)';
            $vessel_key = 'Main SSF vessel type(s)';
            $records = DB::select("SELECT SA.issf_core_id, ATR.attribute_label, AV.value_label FROM selected_attribute AS SA JOIN attribute AS ATR ON SA.attribute_id = ATR.id JOIN attribute_value AS AV ON SA.attribute_value_id = AV.id WHERE SA.attribute_id IN (1,35)");
            $vessels = ['(Dugout) canoe', 'Outrigger craft', 'Other', 'Raft', 'Dory', 'Piroque', 'Wooden', 'Fibreglass', 'Row boat', 'Sail boat', 'Decked (usually with inboard engine)', 'Un-decked/open (with or without inboard engine)'];
            $gears = ['Dredges', 'Falling gear (cast nets)', 'Gillnets and entangling nets', 'Gleaning (collected by hand)', 'Grappling and wounding (harpoons)', 'Harvesting machines', 'Hooks and lines', 'Lift nets', 'Poisons and explosives', 'Recreational fishing gear', 'Seine nets', 'Surrounding nets', 'Traps', 'Trawls', 'Other'];

            foreach($records as $key => $item){
                $country_names = self::get_country_names($item->issf_core_id);
                if(!is_null($country_names) && sizeof($country_names) > 0){
                    $label = $item->attribute_label;
                    foreach($country_names as $country){
                        if(!isset($formatted[$country])){
                            $formatted[$country] = [];
                        }

                        if(!isset($formatted[$country][$gear_key])){
                            $formatted[$country][$gear_key] = [];
                        }

                        if(!isset($formatted[$country][$vessel_key])){
                            $formatted[$country][$vessel_key] = [];
                        }

                        $formatted[$country][$label][] = $item->value_label;
                    }
                }
            }

            $country_names = array_keys($formatted);
            foreach($country_names as $country){
                $vessel_records = $formatted[$country][$vessel_key];
                $gear_records = $formatted[$country][$gear_key];
                $empty_gears = $empty_vessels =  [];
                foreach($gears as $gear){
                    $empty_gears[$gear] = 0;
                }
                foreach($vessels as $vessel){
                    $empty_vessels[$vessel] = 0;
                }
                $results[$country][$gear_key] = $empty_gears;
                $results[$country][$vessel_key] = $empty_vessels;
                foreach($gear_records as $gr){
                    $results[$country][$gear_key][$gr]++;
                }
                foreach($vessel_records as $vr){
                    $results[$country][$vessel_key][$vr]++;
                }
            }

            return $results;
        });
    }
}
