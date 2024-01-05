<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GSLocal;
use App\Models\GSSubnation;
use App\Models\GSNational;
use App\Models\GSRegion;
use App\Models\ISSFCore;


class SearchController extends Controller
{
    public function search($title, $record_type, $contributor_ids, $countries, $startYear, $endYear){
        $record_types = config('constants.RECORD_TYPES');
        $all_records = ISSFCore::all();

        if($record_type !== 'null'){
            $type_search_keys = array_map('strtoupper', explode("|", $record_type));

            $all_records = $all_records->filter(function($record) use ($record_types, $type_search_keys) {
                $record_type_key = array_search($record->core_record_type, $record_types);
                return in_array($record_type_key, $type_search_keys);
            })->values();
        }

        if($contributor_ids !== 'null'){
            $contributors = explode("|", $contributor_ids);
            $all_records = $all_records->filter(fn($record) => in_array($record->contributor_id, $contributors))->values();
        }

        if($startYear !== 'null'){
            $startDate = date($startYear . "-01-01");
            $all_records = $all_records->filter(fn($record) => $record->contribution_date >= $startDate)->values();
        }

        if($endYear !== 'null'){
            $endDate = date($endYear . "-12-31");
            $all_records = $all_records->filter(fn($record) => $record->contribution_date <= $endDate)->values();
        }

        if($countries !== 'null'){
            $all_records = $all_records->filter(function($record) use($countries){
                $countriesArr = explode("|", $countries);
                $geoscopes = config('constants.GEO_SCOPES');
                $records = collect([]);

                switch($record->geographic_scope_type){
                    case $geoscopes['LOCAL']:
                        $records = GSLocal::where('issf_core_id', $record->issf_core_id)->whereIn('country_id', $countriesArr)->first();
                        break;

                    case $geoscopes['SUBNATIONAL']:
                        $records = GSSubnation::where('issf_core_id', $record->issf_core_id)->whereIn('country_id', $countriesArr)->first();
                        break;

                    case $geoscopes['NATIONAL']:
                        $records = GSNational::where('issf_core_id', $record->issf_core_id)->whereIn('country_id', $countriesArr)->first();
                        break;

                    case $geoscopes['REGIONAL']: {
                        $regional_records = GSRegion::where('issf_core_id', $record->issf_core_id)->get();
                        $found = false;
                        if($regional_records){
                            foreach($regional_records as $r){
                                if(sizeof($r->countries) > 0){
                                    foreach($r->countries as $rc){
                                        if(in_array($rc->country_id, $countriesArr)){
                                            $records->push($record);
                                            $found = true;
                                            break;
                                        }
                                    }
                                }
                                if($found) break;
                            }
                        }
                        break;
                    }

                    default: break;
                }
                return $records && $records->count() > 0;
            })->values();
        }

        if($title !== 'null'){
            $all_records = $all_records->filter(fn($record) => str_contains(strtolower($record->core_record_summary), strtolower($title)))->values();
        }

        return [
            'total_results' => $all_records->count(),
            'results' => $all_records
        ];
    }
}
