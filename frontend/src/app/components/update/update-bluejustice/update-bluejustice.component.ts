import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { 
    BLUEJUSTICE_ECOSYSTEM_DETAILED,
    BLUEJUSTICE_ECOSYSTEM_TYPE,
    BLUEJUSTICE_JUSTICE_TYPES,
    BLUEJUSTICE_MAINGEARS_TYPE,
    BLUEJUSTICE_SSF_TERMS,
    BLUEJUSTICE_SSF_TYPE,
    DEFINITE_ANS,
    DETAILS_ACCORDIONS_LABELS, 
    KEEP_BLUEJUSTICE_IMAGE_KEY,
    PANEL_CODES,
    REMOVE_BLUEJUSTICE_IMAGE_KEY,
    UPLOAD_BLUEJUSTICE_IMAGE_KEY
} from '../../../constants/constants';
import { countryList } from '../../../../assets/js/types';
import { getAllCountriesUrl } from '../../../constants/api';
import { 
    updateBluejusticeBasicUrl,
    updateBluejusticeFilesUrl,
    updateBluejusticeGeneralInfoUrl,
    updateBluejusticeSocialIssuesUrl
} from '../../../constants/api';
import { get } from '../../../helpers/apiCalls';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { PostServices } from '../../../services/post.service';
import { CommonServices } from '../../../services/common.service';
import { getOtherValue, toggleOnSpecificValue, toggleSection } from '../../../helpers/helpers';


@Component({
    selector: 'app-update-bluejustice',
    templateUrl: './update-bluejustice.component.html',
    styleUrls: ['./update-bluejustice.component.css']
})


export class UpdateBluejusticeComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('contributorForm') contributorForm: ElementRef;
    @ViewChild('imageForm') imageForm: ElementRef;
    @ViewChild('imageAction') imageAction: ElementRef;
    @ViewChild('generalForm') generalForm: ElementRef;
    @ViewChild('socialJusticeForm') socialJusticeForm: ElementRef;
    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;
    
    countryList: countryList[];
    image: File;
    imageActionKey: string = KEEP_BLUEJUSTICE_IMAGE_KEY;
    definiteAns: DEFINITE_ANS = DEFINITE_ANS;
    definiteValues: string[] = Object.values(this.definiteAns);
    ecoSystemDetail: BLUEJUSTICE_ECOSYSTEM_DETAILED = BLUEJUSTICE_ECOSYSTEM_DETAILED;
    ecoSystemDetailKeys: string[] =  Object.keys(this.ecoSystemDetail);
    ecoSystemTypes: BLUEJUSTICE_ECOSYSTEM_TYPE = BLUEJUSTICE_ECOSYSTEM_TYPE;
    ecoSystemTypesKeys: string[] =  Object.keys(this.ecoSystemTypes);
    justiceTypes: BLUEJUSTICE_JUSTICE_TYPES = BLUEJUSTICE_JUSTICE_TYPES;
    justiceTypesKeys: string[] =  Object.keys(this.justiceTypes);
    justiceTypesLabels: string[];
    mainGears: BLUEJUSTICE_MAINGEARS_TYPE = BLUEJUSTICE_MAINGEARS_TYPE;
    mainGearsKeys: string[] =  Object.keys(this.mainGears);
    ssfTerms: BLUEJUSTICE_SSF_TERMS = BLUEJUSTICE_SSF_TERMS;
    ssfTermsKeys: string[] =  Object.keys(this.ssfTerms);
    ssfTypes: BLUEJUSTICE_SSF_TYPE = BLUEJUSTICE_SSF_TYPE;
    ssfTypesKeys: string[] = Object.keys(this.ssfTypes);
    tabLabels: string[];

    
    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) { }

    
    ngOnInit(): void {         
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['BLUEJUSTICE']);
        this.justiceTypesLabels = this.justiceTypesKeys.map((key: string) => this.justiceTypes[key].label);
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
        });
    }


    getOtherValue(valueArr: string[], lookUpArr: string[]): string|null {
        return getOtherValue(valueArr, lookUpArr);
    }


    inArray(key: string, arr: string[]): boolean {
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    async onBluejusticeUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateBluejusticeBasicUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.generalForm; apiUrl = updateBluejusticeGeneralInfoUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.socialJusticeForm; apiUrl = updateBluejusticeSocialIssuesUrl(this.recordId); break; }
            case this.tabLabels[3]: { form = this.imageForm; apiUrl = updateBluejusticeFilesUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({ 
            panel: PANEL_CODES.BLUEJUSTICE, 
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


    processImage(event: Event){
        this.image = (event.target as HTMLInputElement).files[0];
        this.imageActionKey = UPLOAD_BLUEJUSTICE_IMAGE_KEY;
        this.imageAction.nativeElement.value = this.imageActionKey;
    }


    removeImage(event: Event){
        if(confirm('Are you sure you want to remove this image?')){
            const element = (event.target as HTMLElement);
            const inputElements = Array.from(element.closest('fieldset').querySelectorAll('input'));
            element.parentElement.remove();

            for(const inputEl of inputElements) {
                inputEl.value = null;
            }
            this.imageActionKey = REMOVE_BLUEJUSTICE_IMAGE_KEY;
            this.imageAction.nativeElement.value = this.imageActionKey;
        }
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue, true);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}