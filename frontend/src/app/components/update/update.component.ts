import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from 'rxjs';
import {
    getColorForPanel,
    getCountryNameFromCode,
    getPanelLabelFromCode,
    getRecordDetailsUrl,
    getLoggedInUser
} from '../../helpers/helpers';
import { get } from '../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../constants/api';
import {
    countryList,
    globalAndNotSpecificType,
    localScopeType,
    loggedInUserType,
    nationalScopeType,
    regionalScopeType,
    subnationScopeType
} from '../../../assets/js/types';
import {
    DETAILS_ACCORDIONS_LABELS,
    GEOGRAPHIC_TITLE,
    GS_OPTIONS,
    STORAGE_TOKENS,
    PANEL_CODES,
    RESPONSE_CODES
} from '../../constants/constants';
import { updateGeoscopeUrl } from '../../constants/api';
import { GeoscopeComponent } from '../../components/contribute/geoscope/geoscope.component';
import { AuthServices } from '../../services/auth.service';
import { CommonServices } from '../../services/common.service';
import { PostServices } from '../../services/post.service';
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
    loggedInUser: loggedInUserType
    panelCodes: PANEL_CODES = PANEL_CODES;
    panelTitle: string;
    recordData: any;
    recordId: number;
    responseCodes: RESPONSE_CODES = RESPONSE_CODES;
    scopeSubscription: Subscription;
    selectedGeoScope: string;
    selectedPanel: string;
    selectedPanelKey: string;
    sigininSubscription: Subscription;
    updateResponse: { status_code: number, message: string };
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
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                this.updateResponse = {
                    status_code: updateResponse.status_code,
                    message: updateResponse.message
                }
                if(this.updateResponse.status_code === RESPONSE_CODES.HTTP_200_OK){
                    setTimeout(() => this.updateResponse = null, 5000);
                }
        });

        this.scopeSubscription = this.commonServices.scopeEmitter.subscribe((scope: string) => this.selectedGeoScope = scope);
        this.sigininSubscription = this.authServices.signinEmitter.subscribe((response: {signinRequired: boolean, status_code: number}) => {
            this.isSigninRequired = response.signinRequired;
            if(this.isSigninRequired) return;
            if(response.status_code === RESPONSE_CODES.HTTP_200_OK){
                this.setLoggedInUserInfo();
                if(this.contributorId !== this.userId && this.editorId !== this.userId && !this.isStaff){
                    this.router.navigate(['/details', this.selectedPanel, this.recordId]);
                    return;
                }
            }
        });
    }


    ngOnInit(): void {
        this.geographicTabTitle = GEOGRAPHIC_TITLE;
        this.route.paramMap.subscribe(params => {
            this.recordId = parseInt(params.get("recordId"));
            this.selectedPanel = params.get("panel");
            this.selectedPanelKey = this.selectedPanel.toUpperCase();
        });

        this.setLoggedInUserInfo()

        const recordDetailsUrl = getRecordDetailsUrl(this.selectedPanel, this.recordId);
        get(recordDetailsUrl).then(async (data: any) => {
            this.recordData = data;
            this.contributorId = data.core.contributor_id;
            this.editorId = data.core.editor_id;
            if(this.authServices.isLoggedIn()){
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


    scopeTypeToFormMapping(selectedGeoScope: string): {form: ElementRef, keyName: string} {
        switch(selectedGeoScope){
            case GS_OPTIONS.LOCAL: return { form: this.geoScope.localFormRef, keyName: 'gs_local_list' };
            case GS_OPTIONS.SUB_NATIONAL: return { form: this.geoScope.subnationalFormRef, keyName: 'gs_subnation_list' };
            case GS_OPTIONS.REGIONAL: return { form: this.geoScope.regionalFormRef, keyName: 'gs_region_list' };
            case GS_OPTIONS.NATIONAL: return { form: this.geoScope.nationalFormRef, keyName: 'gs_nation' };
            default: return;
        }
    }


    async onGeoscopeUpdate() {
        let formType: ElementRef|null;
        let skipRequiredCheck: boolean = true;
        const geoFormData = {geo_scope: {}};

        geoFormData['geographic_scope_type'] = this.selectedGeoScope;
        if(this.selectedGeoScope !== GS_OPTIONS.GLOBAL && this.selectedGeoScope !== GS_OPTIONS.NOT_SPECIFIC){
            skipRequiredCheck = false;
            const { form, keyName } = this.scopeTypeToFormMapping(this.selectedGeoScope);
            formType = form;
            geoFormData.geo_scope[keyName] = this.selectedGeoScope === GS_OPTIONS.NATIONAL
                ? parseInt(Object.values(formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope)[0])[0].toString())
                : formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope);
        }

        await this.postServices.update(
            formType,
            geoFormData,
            updateGeoscopeUrl(this.recordId),
            skipRequiredCheck
        );
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
                    mapPoints: geoscopeData.map((gs: any) => gs.area_point?.coordinates),
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
                    mapPoints: geoscopeData.map((gs: any) => gs.subnation_point?.coordinates),
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


    setLoggedInUserInfo(){
        this.loggedInUser =  getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS));
        this.userId = this.loggedInUser.userId;
        this.isStaff = this.loggedInUser.isStaff;
    }
}
