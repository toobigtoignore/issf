import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Contents } from '../../../services/contents.service';
import { CommonServices } from '../../../services/common.service';
import { get } from '../../../helpers/apiCalls';
import { countryList } from '../../../../assets/js/types';
import { PostServices } from '../../../services/post.service';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { PANEL_CODES } from '../../../constants/constants'; 
import { 
    DEFINITE_ANS,
    DETAILS_ACCORDIONS_LABELS,
    ORGANIZATION_MAIN_ACTIVITIES,
    ORGANIZATION_CHECKBOX_TYPES,
    ORGANIZATION_MOTIVATION,
    ORGANIZATION_NETWORKS,
    SPECIES_LINKS_TYPES,
} from '../../../constants/constants';
import { 
    getAllCountriesUrl,
    updateOrganizationUrl,
    updateThemeUrl,
    updateExternalLinksUrl
} from '../../../constants/api';
import { getOtherValue, getYears, toggleOnSpecificValue, toggleSection } from '../../../helpers/helpers';


@Component({
    selector: 'app-update-organization',
    templateUrl: './update-organization.component.html',
    styleUrls: ['./update-organization.component.css']
})


export class UpdateOrganizationComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('themeForm') themeForm: ElementRef;
    @ViewChild('linksForm') linksForm: ElementRef;

    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;
    
    countryList: countryList[];
    species_link_types: SPECIES_LINKS_TYPES = SPECIES_LINKS_TYPES;
    tabLabels: string[];
    years: number[];

    definiteAns: DEFINITE_ANS = DEFINITE_ANS;    
    definiteValues: string[] = Object.values(this.definiteAns);

    organizationTypes: ORGANIZATION_CHECKBOX_TYPES = ORGANIZATION_CHECKBOX_TYPES;
    organizationMotivations: ORGANIZATION_MOTIVATION = ORGANIZATION_MOTIVATION;
    organizationActivities: ORGANIZATION_MAIN_ACTIVITIES = ORGANIZATION_MAIN_ACTIVITIES;
    organizationNetworks: ORGANIZATION_NETWORKS = ORGANIZATION_NETWORKS;

    organizationTypesKeys: string[] =  Object.keys(this.organizationTypes);
    organizationMotivationsKeys: string[] =  Object.keys(this.organizationMotivations);
    organizationActivitiesKeys: string[] =  Object.keys(this.organizationActivities);
    organizationNetworksKeys: string[] =  Object.keys(this.organizationNetworks);

    
    constructor(
        private commonServices: CommonServices,
        private contents: Contents,
        private postServices: PostServices
    ) { }

    
    ngOnInit(): void { 
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
        });
        this.years = getYears(1930);
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['ORGANIZATION']);
    }


    characterDecode(str: string): string{
        return str.replace(/&#x27;/g, '\'');
    }


    fetchAddressLine(address: string, line: number): string{
        const addresses = address.split('\n');
        if(line === 1) return this.characterDecode(addresses[0]);
        if(line === 2) return this.characterDecode(addresses[1]);
        return null;
    }


    getOtherValue(valueArr: string[], lookUpArr: string[]): string|null {
        return getOtherValue(valueArr, lookUpArr);
    }


    inArray(key: string, arr: string[]) {
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    async onOrganizationUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateOrganizationUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.themeForm; apiUrl = updateThemeUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.linksForm; apiUrl = updateExternalLinksUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({ 
            panel: PANEL_CODES.ORGANIZATION, 
            formType: formType, 
            formElement: form
        });
        const { data, errorMsg } = formatted;
        if(errorMsg) {
            this.commonServices.updateEmitter.emit({ 
                status: 'error',  
                message: errorMsg 
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        await this.postServices.update(form, data, apiUrl);
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue, true);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}