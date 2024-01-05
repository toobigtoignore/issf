import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from 'rxjs';
import {
    getColorForPanel,
    getCountryNameFromCode,
    getPanelLabelFromCode,
    getRecordDetailsUrl,
    getUserId
} from '../../helpers/helpers';
import { get } from '../../helpers/apiCalls';
import { getAllCountriesUrl, getUserUrl } from '../../constants/api';
import {
    countryList,
    globalAndNotSpecificType,
    localScopeType,
    nationalScopeType,
    regionalScopeType,
    subnationScopeType
} from '../../../assets/js/types';
import {
    DETAILS_ACCORDIONS_LABELS,
    GEOGRAPHIC_TITLE,
    GS_OPTIONS,
    JWT_TOKENS,
    PANEL_CODES
} from '../../constants/constants';
import { updateGeoscopeUrl } from '../../constants/api';
import { GeoscopeComponent } from '../../components/contribute/geoscope/geoscope.component';
import { AuthServices } from '../../services/auth.service';
import { CommonServices } from '../../services/common.service';
import { PostServices } from '../../services/post.service';
import { FormattedGeoData } from '../../models/formatted-geo-data.model';
import { formatGeoScopeForm } from '../../helpers/formInputFormatter';


@Component({
    selector: 'app-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.css']
})


export class UpdateComponent implements OnInit {
    @ViewChild(GeoscopeComponent, {static: false}) geoScope: GeoscopeComponent;

    activeTab: string;
    contributorId: number;
    countryList: countryList[];
    editorId: number;
    geographicTabTitle: string;
    geoScopeInfo: globalAndNotSpecificType | localScopeType | subnationScopeType | nationalScopeType | regionalScopeType;
    isSigninRequired: boolean = false;
    isStaff: boolean;
    loggedInStatusSubscription: Subscription;
    panelCodes: PANEL_CODES = PANEL_CODES;
    panelTitle: string;
    recordData: any;
    recordId: number;
    scopeSubscription: Subscription;
    selectedGeoScope: string;
    selectedPanel: string;
    selectedPanelKey: string;
    sigininSubscription: Subscription;
    updateResponse: { status: string, message: string };
    tabLabels: DETAILS_ACCORDIONS_LABELS;
    updateSubscription: Subscription;
    userId: number;


    constructor(
        private authServices: AuthServices,
        private route: ActivatedRoute,
        private commonServices: CommonServices,
        private postServices: PostServices,
        private router: Router
    ) {
        // this.updateSubscription = this.commonServices.updateEmitter.subscribe(
        //     (updateResponse: any) => {
        //         this.updateResponse = {
        //             status: updateResponse.status,
        //             message: updateResponse.message
        //         }
        //         if(this.updateResponse.status === 'success'){
        //             setTimeout(() => this.updateResponse = null, 5000);
        //         }
        // });
        // this.scopeSubscription = this.commonServices.scopeEmitter.subscribe((scope: string) => this.selectedGeoScope = scope);
        // this.loggedInStatusSubscription = this.authServices.loginStatusEmitter.subscribe((loginStatus: boolean) => this.isSigninRequired = loginStatus);
        // this.sigininSubscription = this.authServices.signinEmitter.subscribe((response: {message: string, status_code: number}) => {
        //     if(response.status_code === 200){
        //         this.userId = getUserId(localStorage.getItem(JWT_TOKENS.REFRESH));
        //         this.isSigninRequired = false;
        //         if(this.contributorId !== this.userId && this.editorId !== this.userId && !this.isStaff){
        //             this.router.navigate(['/details', this.selectedPanel, this.recordId]);
        //             return;
        //         }
        //     }
        // });
    }


    ngOnInit(): void {
        this.geographicTabTitle = GEOGRAPHIC_TITLE;
        this.route.paramMap.subscribe(params => {
            this.recordId = parseInt(params.get("recordId"));
            this.selectedPanel = params.get("panel");
            this.selectedPanelKey = this.selectedPanel.toUpperCase();
        });

        const recordDetailsUrl = getRecordDetailsUrl(this.selectedPanel, this.recordId);
        get(recordDetailsUrl).then(async (data: any) => {
            this.recordData = data;
            this.contributorId = data.contributor_id;
            this.editorId = data.editor_id;

            if(this.authServices.isLoggedIn()){
                this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
                const userInfo = await get(getUserUrl(this.userId));
                this.isStaff = userInfo.is_staff;
                if(this.userId !== this.contributorId && this.userId !== this.editorId && !this.isStaff){
                    this.router.navigate(['/details', this.selectedPanel, this.recordId]);
                }
            }

            this.countryList = await get(getAllCountriesUrl);
            this.prepareGeographicInfo();
        });

        this.panelTitle = getPanelLabelFromCode(this.selectedPanel);
        let accordionLabels = DETAILS_ACCORDIONS_LABELS[this.selectedPanelKey];

        // remove the contributor's information tab if the record is not type who
        if(this.selectedPanel != PANEL_CODES.WHO){
            accordionLabels = accordionLabels.slice(0, -1);
        }
        this.tabLabels = [
            ...accordionLabels,
            GEOGRAPHIC_TITLE
        ];
        this.activeTab = this.tabLabels[0];
    }


    ngOnDestroy() {
        if(this.scopeSubscription) this.scopeSubscription.unsubscribe();
        if(this.loggedInStatusSubscription) this.loggedInStatusSubscription.unsubscribe();
        if(this.updateSubscription) this.updateSubscription.unsubscribe();
        if(this.sigininSubscription) this.sigininSubscription.unsubscribe();
    }


    getPanelColor(){
        return getColorForPanel(this.selectedPanel);
    }


    async onGeoscopeUpdate() {
        let form: ElementRef;
        let shouldSkipRequiredFieldCheck = true;
        const formattedGeoData = new FormattedGeoData;
        const geoFormData = formattedGeoData.getGeoScopeDefaultData();
        geoFormData.gs_type = this.selectedGeoScope;
        if(
            this.selectedGeoScope !== GS_OPTIONS.NOT_SPECIFIC &&
            this.selectedGeoScope !== GS_OPTIONS.GLOBAL
        ){
            shouldSkipRequiredFieldCheck = false;
            switch(this.selectedGeoScope){
                case GS_OPTIONS.LOCAL: {
                    geoFormData.gs_local_list = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope);
                    form = this.geoScope.localFormRef;
                    break;
                }
                case GS_OPTIONS.SUB_NATIONAL: {
                    geoFormData.gs_subnation_list = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope);
                    form = this.geoScope.subnationalFormRef;
                    break;
                }
                case GS_OPTIONS.REGIONAL: {
                    geoFormData.gs_region_list = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope);
                    form = this.geoScope.regionalFormRef;
                    break;
                }
                case GS_OPTIONS.NATIONAL: {
                    geoFormData.gs_nation.country = parseInt(Object.values(formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope)[0])[0].toString());
                    form = this.geoScope.nationalFormRef;
                    break;
                }
                default: break;
            }
        }
        await this.postServices.update(form, geoFormData, updateGeoscopeUrl(this.recordId), shouldSkipRequiredFieldCheck);
    }


    onTriggerPress(label: string){
        this.activeTab = label;
        this.updateResponse = null;
        /*
            trigger resize function to move the map to the appropriate location
            needed only for local and sub-national geo scope as only these two have the map
        */
        window.dispatchEvent(new Event('resize'));
    }


    prepareGeographicInfo() {
        const geoscope = this.recordData.core.geographic_scope_type;
        const geoscopeData = this.recordData.geoscope;
        switch(geoscope){
            case GS_OPTIONS.LOCAL: {
                this.geoScopeInfo = {
                    type: geoscope,
                    areaNames: geoscopeData.map((gs: any) => gs.area_name),
                    alternateNames: geoscopeData.map((gs: any) => gs.alternate_name),
                    countryCodes: geoscopeData.map((gs: any) => gs.country_id),
                    areaSettings: geoscopeData.map((gs: any) => gs.setting_other || gs.setting),
                    mapPoints: geoscopeData.map((gs: any) => gs.area_point.coordinates),
                    numberOfScope: geoscopeData.length
                };
                break;
            }
            case GS_OPTIONS.SUB_NATIONAL: {
                this.geoScopeInfo = {
                    type: geoscope,
                    subnationNames: geoscopeData.map((gs: any) => gs.name),
                    subnationCountries: geoscopeData.map((gs: any) => gs.country_id),
                    subnationTypes: geoscopeData.map((gs: any) => gs.type_other || gs.type),
                    mapPoints: geoscopeData.map((gs: any) => gs.subnation_point.coordinates),
                    numberOfScope: geoscopeData.length
                };
                break;
            }
            case GS_OPTIONS.NATIONAL: {
                this.geoScopeInfo = {
                    type: geoscope,
                    country: geoscopeData[0].country_id
                };
                break;
            }
            case GS_OPTIONS.REGIONAL: {
                this.geoScopeInfo = {
                    type: geoscope,
                    regions: geoscopeData.map((gs: any) => gs.region_name_other || gs.region.region_name),
                    countries: geoscopeData.map((gs: any) => {
                        return gs.countries.map((country: any) => getCountryNameFromCode(country.country_id));
                    }),
                    numberOfScope: geoscopeData.length
                };
                break;
            }
            default: {
                this.geoScopeInfo = {
                    type: geoscope,
                    numberOfScope: 1
                };
                break;
            }
        }
    }
}
