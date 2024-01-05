import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { PANEL_CODES } from '../../../constants/constants'; 
import { get } from '../../../helpers/apiCalls';
import { languages } from '../../../../assets/js/types';
import { 
    DEFINITE_ANS,
    DETAILS_ACCORDIONS_LABELS, 
    SPECIES_LINKS_TYPES, 
    SOTA_PUBLICATION_TYPES,
    SOTA_DEMOGRAPHIC_FACTORS,
    SOTA_EMPLOYMENT_STATUS,
    SOTA_FISHERY_STAGE
} from '../../../constants/constants';
import { 
    getLanguagesUrl,
    updateCharacteristicsUrl,
    updateExternalLinksUrl,
    updateSotaAdditionalUrl,
    updateSotaBasicUrl,
    updateSpeciesUrl,
    updateThemeUrl
} from '../../../constants/api';
import { getOtherValue, getYears, toggleOnSpecificValue, toggleSection } from '../../../helpers/helpers';


@Component({
    selector: 'app-update-sota',
    templateUrl: './update-sota.component.html',
    styleUrls: ['./update-sota.component.css']
})


export class UpdateSotaComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('themeForm') themeForm: ElementRef;
    @ViewChild('characteristicsForm') characteristicsForm: ElementRef;
    @ViewChild('additionalForm') additionalForm: ElementRef;
    @ViewChild('speciesForm') speciesForm: ElementRef;
    @ViewChild('linksForm') linksForm: ElementRef;

    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;
    
    isOtherPublicationType: boolean;
    languages: languages[];
    species_link_types: SPECIES_LINKS_TYPES = SPECIES_LINKS_TYPES;
    tabLabels: string[];
    years: number[];

    definiteAns: DEFINITE_ANS = DEFINITE_ANS;
    demographicFactor: SOTA_DEMOGRAPHIC_FACTORS = SOTA_DEMOGRAPHIC_FACTORS;
    employmentStatus: SOTA_EMPLOYMENT_STATUS = SOTA_EMPLOYMENT_STATUS;
    fisheryStage: SOTA_FISHERY_STAGE = SOTA_FISHERY_STAGE;
    publicationTypes: SOTA_PUBLICATION_TYPES = SOTA_PUBLICATION_TYPES;
    
    definiteValues: string[] = Object.values(this.definiteAns);
    demographicFactorKeys: string[] =  Object.keys(this.demographicFactor);
    employmentStatusKeys: string[] =  Object.keys(this.employmentStatus);
    fisheryStageKeys: string[] =  Object.keys(this.fisheryStage);

    
    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) { }

    
    ngOnInit(): void { 
        get(getLanguagesUrl).then(async (languages: any) => {
            this.languages = languages;
        });
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['SOTA']);
        this.isOtherPublicationType = this.isPublicationOther();
        this.years = getYears(1990);
    }


    getOtherValue(valueArr: string[], lookUpArr: string[]): string|null {
        return getOtherValue(valueArr, lookUpArr);
    }


    inArray(key: string, arr: string[]) {
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    isPublicationOther(){
        const titles = this.publicationTypes.map((p: SOTA_PUBLICATION_TYPES) => p.title)
        if(titles.indexOf(this.record.publication_type) === -1) return true;
        return false;
    }


    async onSotaUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateSotaBasicUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.themeForm; apiUrl = updateThemeUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.characteristicsForm; apiUrl = updateCharacteristicsUrl(this.recordId); break; }
            case this.tabLabels[3]: { form = this.additionalForm; apiUrl = updateSotaAdditionalUrl(this.recordId); break; }
            case this.tabLabels[4]: { form = this.speciesForm; apiUrl = updateSpeciesUrl(this.recordId); break; }
            case this.tabLabels[5]: { form = this.linksForm; apiUrl = updateExternalLinksUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({ 
            panel: PANEL_CODES.SOTA, 
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
        toggleOnSpecificValue(event, targetValue);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}