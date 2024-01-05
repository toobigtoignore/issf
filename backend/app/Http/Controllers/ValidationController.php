<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ValidationController extends Controller
{
    public static function geographic_scope_rules(){
        return [
            'geo_scope.gs_local_list' => 'required_if:basic_info.geographic_scope_type,' . config('constants.GEO_SCOPES.LOCAL'),
            'geo_scope.gs_subnation_list' => 'required_if:basic_info.geographic_scope_type,' . config('constants.GEO_SCOPES.SUBNATIONAL'),
            'geo_scope.gs_region_list' => 'required_if:basic_info.geographic_scope_type,' . config('constants.GEO_SCOPES.REGIONAL'),
            'geo_scope.gs_nation' => 'required_if:basic_info.geographic_scope_type,' . config('constants.GEO_SCOPES.NATIONAL')
        ];
    }
}
