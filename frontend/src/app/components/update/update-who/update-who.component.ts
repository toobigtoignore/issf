import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonServices } from '../../../services/common.service';
import { get } from '../../../helpers/apiCalls';
import { PostServices } from '../../../services/post.service';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { PANEL_CODES } from '../../../constants/constants'; 
import { 
    DETAILS_ACCORDIONS_LABELS, 
    SPECIES_LINKS_TYPES, 
    WHO_EDUCATION_LEVELS 
} from '../../../constants/constants';
import { 
    getAllCountriesUrl,
    getAllOrganizationNamesUrl,
    updateWhoBasicUrl,
    updateWhoResearcherUrl,
    updateThemeUrl,
    updateSpeciesUrl,
    updateExternalLinksUrl,
} from '../../../constants/api';
import { toggleOnSpecificValue } from '../../../helpers/helpers';


@Component({
    selector: 'app-update-who',
    templateUrl: './update-who.component.html',
    styleUrls: ['./update-who.component.css']
})


export class UpdateWhoComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('researcherInfo') researcherInfo: ElementRef;
    @ViewChild('themeForm') themeForm: ElementRef;
    @ViewChild('speciesForm') speciesForm: ElementRef;
    @ViewChild('linksForm') linksForm: ElementRef;

    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;

    countryList: string[];
    organizationList: string[];
    educationLevels: WHO_EDUCATION_LEVELS = WHO_EDUCATION_LEVELS;
    isOtherEducationLevel: boolean;
    species_link_types: SPECIES_LINKS_TYPES = SPECIES_LINKS_TYPES;
    tabLabels: string[];

    
    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) { }

    
    async ngOnInit(): Promise<void> { 
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['WHO']);
        this.isOtherEducationLevel = this.isEducationLevelOther();
        this.countryList = await get(getAllCountriesUrl);
        this.organizationList = await get(getAllOrganizationNamesUrl);
    }


    inArray(key: string, arr: string[]) {
        if(!key || !arr) return;
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    isEducationLevelOther(){
        if(
            this.record.highest_education !== '' &&
            this.educationLevels.indexOf(this.record.highest_education) === -1
        ) return true;
        return false;
    }


    async onWhoUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateWhoBasicUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.researcherInfo; apiUrl = updateWhoResearcherUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.themeForm; apiUrl = updateThemeUrl(this.recordId); break; }
            case this.tabLabels[3]: { form = this.speciesForm; apiUrl = updateSpeciesUrl(this.recordId); break; }
            case this.tabLabels[4]: { form = this.linksForm; apiUrl = updateExternalLinksUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({ 
            panel: PANEL_CODES.WHO, 
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
}