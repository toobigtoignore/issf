export class FormattedGeoData {
    private geoScopeData: {
        gs_type: string,
        gs_local_list: {}[],
        gs_subnation_list: {}[],
        gs_region_list: {}[],
        gs_nation: { country: number },
        gs_global_notspecific: { gs_type: string }
    };


    constructor(){ 
        this.geoScopeData = {
            gs_type: "",
            gs_local_list: [{
                local_area_name: '',
                local_area_setting: '',
                local_area_point: { lat: 0, long: 0 },
                local_area_alternate_name: '',
                local_area_setting_other: '',
                country: 0
            }],
        
            gs_subnation_list: [{
                subnation_name: '',
                subnation_type: '',
                country: 0,
                subnation_type_other: '',
                subnation_point: { lat: 0, long: 0 }
            }],
        
            gs_region_list: [{
                region_name: '',
                other_region_name: '',
                countries: []
            }],
        
            gs_nation: { 
                country: 0
            },
            
            gs_global_notspecific: { 
                gs_type: ''
            }
        }
    }


    public getGeoScopeDefaultData() {       
        return this.geoScopeData;
    }
}