import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { GS_OPTIONS, JWT_TOKENS, INITIAL_CONTRIBUTION, PANEL_CODES, PANEL_VALUES, RESPONSE_CODES, RESPONSE_MESSAGE } from '../../constants/constants';
import { getAllContributorsUrl, getAllCountriesUrl } from '../../constants/api';
import { GeoscopeComponent } from './geoscope/geoscope.component';
import { Contents } from '../../services/contents.service';
import { AuthServices } from '../../services/auth.service';
import { CommonServices } from '../../services/common.service';
import { PostServices } from '../../services/post.service';
import { countryList } from '../../../assets/js/types';
import { get } from '../../helpers/apiCalls';
import { getColorForPanel, getContributorsFullName, getUserId } from '../../helpers/helpers';
import { formatFormValues, formatGeoScopeForm, checkRequiredFields } from '../../helpers/formInputFormatter';


@Component({
    selector: 'app-contribute',
    templateUrl: './contribute.component.html',
    styleUrls: ['./contribute.component.css']
})


export class ContributeComponent implements OnInit {
    @ViewChild('basicForm', {static: true}) basicForm: ElementRef;
    @ViewChild(GeoscopeComponent, {static: false}) geoScope: GeoscopeComponent;
    contributorsList: any;
    panelCodesObj: PANEL_CODES;
    panelCodes: PANEL_CODES;
    panelValues: PANEL_VALUES;
    countryList: countryList[];
    activePanel: string;
    formSeq: number;
    selectedGeoScope: string;
    currentRoute: string;
    lastContributionId: number;
    signinHandlerResponse: Object;
    isSigninRequired: boolean = false;
    loading: boolean = false;
    paramsSubscription: any;
    scopeSubscription: any;
    sigininSubscription: any;
    userId: number;


    constructor(
        private route: ActivatedRoute,
        private contents: Contents,
        private authServices: AuthServices,
        private commonServices: CommonServices,
        private postServices: PostServices,
        private router: Router
    ) {
        if(!this.authServices.isLoggedIn()){
            this.router.navigate(['/registration']);
            return;
        }

        this.scopeSubscription = this.commonServices.scopeEmitter.subscribe((scope: string) => this.selectedGeoScope = scope);
        this.sigininSubscription = this.authServices.signinEmitter.subscribe((response: {message: string, status_code: number}) => {
            if(response.status_code === 200){
                this.isSigninRequired = false;
            }
        });
    }


    async ngOnInit(): Promise<void> {
        this.paramsSubscription = this.route.paramMap.subscribe(params => {
            this.activePanel = params.get("panelID");
        });
        this.panelCodesObj = PANEL_CODES;
        this.activePanel = !this.activePanel ? this.panelCodesObj.SOTA : this.activePanel;
        this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
        this.panelCodes = Object.values(PANEL_CODES).slice(1);
        this.panelValues = Object.values(PANEL_VALUES).slice(1);
        this.formSeq = 1;
        this.countryList = await get(getAllCountriesUrl);
        this.contributorsList = await get(getAllContributorsUrl);
        this.contributorsList.map((contributor: any) =>{
            contributor.full_name = getContributorsFullName(contributor)
        });
    }


    ngOnDestroy() {
        if(this.paramsSubscription) this.paramsSubscription.unsubscribe();
        if(this.scopeSubscription) this.scopeSubscription.unsubscribe();
        if(this.sigininSubscription) this.sigininSubscription.unsubscribe();
    }


    getPanelColor(panel: string):string {
        return getColorForPanel(panel);
    }


    getPanelIcon(panel: string):string {
        switch(panel) {
            case PANEL_CODES.WHO: return '../../../assets/img/map-controller-icons/icon-who.png';
            case PANEL_CODES.SOTA: return '../../../assets/img/map-controller-icons/icon-sota.png';
            case PANEL_CODES.PROFILE: return '../../../assets/img/map-controller-icons/icon-profile.png';
            case PANEL_CODES.ORGANIZATION: return '../../../assets/img/map-controller-icons/icon-organization.png';
            case PANEL_CODES.CASESTUDY: return '../../../assets/img/map-controller-icons/icon-case.png';
            case PANEL_CODES.GOVERNANCE: return '../../../assets/img/map-controller-icons/icon-governance.png';
            case PANEL_CODES.BLUEJUSTICE: return '../../../assets/img/map-controller-icons/icon-bluejustice.png';
            case PANEL_CODES.GUIDELINES: return '../../../assets/img/map-controller-icons/icon-guidelines.png';
        }
    }


    getLabel(code: string):string {
        return this.contents.getPanelLabelFromCode(code);
    }


    onPanelChange(code: string){
        if(code !== this.activePanel){
            if(this.hasFormUpdated() && this.formSeq != 3){
                if(confirm('It looks like you have made some changes in the form but have not submitted the record. The changes you have made will be removed if you leave. Sure you want to leave this section?')){
                    this.updateUrl(code);
                }
                return;
            }
            this.updateUrl(code);
        }
    }


    updateUrl(panelCode: string){
        const routerPath = this.route.snapshot.routeConfig.path.split('/')[0];
        this.router.navigateByUrl('/' + routerPath, { skipLocationChange: true }).then(() => {
            this.router.navigate([routerPath, panelCode]);
        });
    }


    hasFormUpdated(){
        const formEl = this.basicForm.nativeElement.elements;
        for(let i in formEl){
            let inputItem = formEl[i] as HTMLFormElement;
            if(inputItem.value && inputItem.value.trim() !== "") {
                return true;
            }
        }
        return false;
    }


    validateBasicForm() {
        let clearToMoveNext:boolean = checkRequiredFields(this.basicForm);

        if(clearToMoveNext) {
            this.formSeq = 2;
            // trigger resize function to move the map to the appropriate location
            window.dispatchEvent(new Event('resize'));
        }
    }


    async submitRecord(){
        if(!this.validateGeoForm()) return;

        const dataToSubmit = this.prepareFinalData();

        // check if the user is still logged in and whether the login token is valid
        if(this.authServices.isLoggedIn()){
            this.loading = true;
            this.postServices
                .createRecord(this.activePanel, dataToSubmit)
                .subscribe(response => {
                    this.apiResponse(response)
                });

            return;
        }

        // else refresh token has expired and signing in again is required
        this.isSigninRequired = true;
    }


    validateGeoForm() {
        let clearToSubmit: boolean = true;
        const forms = this.geoScope.scopeDetails.nativeElement.querySelectorAll(`[geogroup="${this.selectedGeoScope}"]`);
        for(let currentForm of forms){
            const requiredFields = currentForm.querySelectorAll('[required]');
            for(let field of requiredFields){
                if(field.value === "" && !field.hasAttribute('disabled')){
                    field.classList.add('not-satisfied');
                    field.setAttribute('placeholder', 'This field is required...');
                    clearToSubmit = false;
                }
            }
        }
        return clearToSubmit;
    }


    prepareFinalData(): Object {
        const submitData = { basic_info: {}, geo_scope: {} };

        // prepare data to submit
        submitData.basic_info = formatFormValues({
            panel: this.activePanel,
            formType: INITIAL_CONTRIBUTION,
            formElement: this.basicForm
        });

        submitData.basic_info['geographic_scope_type'] = this.selectedGeoScope;
        submitData.basic_info['record_type'] = PANEL_VALUES[this.activePanel.toUpperCase()];
        submitData.basic_info['contributor_id'] = this.userId;

        if(this.selectedGeoScope === GS_OPTIONS.GLOBAL || this.selectedGeoScope === GS_OPTIONS.NOT_SPECIFIC){
            submitData.geo_scope['gs_global_notspecific'] = this.selectedGeoScope;
        }
        else {
            switch(this.selectedGeoScope){
                case GS_OPTIONS.LOCAL: submitData.geo_scope['gs_local_list'] = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope); break;
                case GS_OPTIONS.SUB_NATIONAL: submitData.geo_scope['gs_subnation_list'] = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope); break;
                case GS_OPTIONS.REGIONAL: submitData.geo_scope['gs_region_list'] = formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope); break;
                case GS_OPTIONS.NATIONAL: submitData.geo_scope['gs_nation'] = parseInt(Object.values(formatGeoScopeForm(this.geoScope.scopeDetails, this.selectedGeoScope)[0])[0].toString()); break;
                default: break;
            }
        }

        return submitData;
    }


    apiResponse(response: any) {
        const self = this;
        if(response.status_code){
            const statusCode = parseInt(response.status_code);

            if(statusCode === RESPONSE_CODES.HTTP_200_OK) this.formSeq = 3;
            else this.formSeq = 2;

            switch(statusCode){
                case RESPONSE_CODES.HTTP_200_OK: this.lastContributionId = response.record_id; break;
                case RESPONSE_CODES.HTTP_400_BAD_REQUEST: alert(RESPONSE_MESSAGE.VALIDATION_ERRORS); break;
                default: alert(RESPONSE_MESSAGE.UNKNOWN_ERROR); break;
            }
        }

        else alert(RESPONSE_MESSAGE.UNKNOWN_ERROR);

        setTimeout(() => {
            self.loading = false;
        }, 1000);
    }


    onFinishPress(){
        this.router.navigate(['/details', this.activePanel, this.lastContributionId]);
    }
}
