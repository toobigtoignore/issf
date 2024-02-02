import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonServices } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { get } from '../../../helpers/apiCalls';
import { PostServices } from '../../../services/post.service';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { PANEL_CODES, RESPONSE_CODES } from '../../../constants/constants';
import {
    DETAILS_ACCORDIONS_LABELS,
    KEEP_IMAGE_KEY,
    MAX_FILE_SIZE,
    REMOVE_IMAGE_KEY,
    SPECIES_LINKS_TYPES,
    STORAGE_TOKENS,
    UPLOAD_IMAGE_KEY,
    WHO_EDUCATION_LEVELS
} from '../../../constants/constants';
import {
    getAllCountriesUrl,
    getAllOrganizationsUrl,
    updateWhoBasicUrl,
    updateWhoResearcherUrl,
    updateThemeUrl,
    updateSpeciesUrl,
    updateExternalLinksUrl,
} from '../../../constants/api';
import {
    getLoggedInUser,
    toggleOnSpecificValue
} from '../../../helpers/helpers';


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
    @ViewChild('selectedOrganizations') selectedOrganizations: ElementRef;
    @ViewChild('imageAction') imageAction: ElementRef;
    @ViewChild('imageInput') imageInput: ElementRef;
    @ViewChild('previewImage') previewImage: ElementRef;

    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;

    allOrganizations: any;
    affiliatedOrganizationsId: number[] = [];
    countryList: string[];
    educationLevels: WHO_EDUCATION_LEVELS = WHO_EDUCATION_LEVELS;
    fileTooBigError: boolean = false;
    image: File;
    imageActionKey: string = KEEP_IMAGE_KEY;
    imageUrl: string = environment.SSF_PERSON_IMAGE_URL;
    isOtherEducationLevel: boolean;
    primaryOrganizationId: number;
    showImage: boolean = false;
    species_link_types: SPECIES_LINKS_TYPES = SPECIES_LINKS_TYPES;
    selectedOrganizationIds: string;
    tabLabels: string[];
    user: any;


    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) { }


    async ngOnInit(): Promise<void> {
        this.user = getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS));
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['WHO']);
        this.isOtherEducationLevel = this.isEducationLevelOther();
        this.countryList = await get(getAllCountriesUrl);
        this.allOrganizations = await get(getAllOrganizationsUrl);
        this.record.organizations.map((org: any) => {
            if(!org.is_primary_affiliation) {
                this.affiliatedOrganizationsId.push(org.organization_id);
            }
        });
        this.primaryOrganizationId = this.record.organizations.filter((org: any) => !!org.is_primary_affiliation)[0]?.organization_id;
        this.selectedOrganizationIds = this.affiliatedOrganizationsId?.length > 0 ? this.affiliatedOrganizationsId.toString() : null;
        this.showImage = this.record.img !== null && this.record.img !== '';
    }


    filterOrganizations(event: Event){
        const element = event.target as HTMLFormElement;
        const options = Array.from(element.closest('.form-input').querySelectorAll('.select-option'));
        options.filter(option => {
            const optionText = option.textContent.toLowerCase();
            const value = element.value.toLowerCase();

            if(optionText.startsWith(value)) (option as HTMLElement).style.display = 'block';
            else (option as HTMLElement).style.display = 'none';
        });
    }


    isEducationLevelOther(){
        if(this.educationLevels.includes(this.record.education_level)) return false;
        return true;
    }


    onOrganizationSelect(event: Event){
        const element = event.target as HTMLElement;
        const value = element.getAttribute('value');
        const organizationsId = this.selectedOrganizationIds ? this.selectedOrganizationIds.split(',') : [];
        if(element.classList.contains('selected')) {
            element.classList.remove('selected');
            organizationsId.splice(organizationsId.indexOf(value), 1);
        }
        else {
            element.classList.add('selected');
            organizationsId.push(value)
        }
        this.selectedOrganizationIds = organizationsId.toString();
        this.selectedOrganizations.nativeElement.value = this.selectedOrganizationIds;
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
            recordType: PANEL_CODES.WHO,
            formType: formType,
            formElement: form
        });
        const { data, errorMsg } = formatted;

        if(errorMsg) {
            this.commonServices.updateEmitter.emit({
                status_code: RESPONSE_CODES.HTTP_500_INTERNAL_SERVER_ERROR,
                message: errorMsg
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        await this.postServices.update(form, data, apiUrl);
    }


    processImage(event: Event){
        this.image = (event.target as HTMLInputElement).files[0];
        this.fileTooBigError = this.image.size > MAX_FILE_SIZE;

        if(this.fileTooBigError){
            this.imageInput.nativeElement.value = null;
            return;
        }

        this.imageActionKey = UPLOAD_IMAGE_KEY;
        this.imageAction.nativeElement.value = this.imageActionKey;

        if(this.image){
            const reader = new FileReader();
            reader.onload = (e) => this.previewImage.nativeElement.src = e.target.result;
            reader.readAsDataURL(this.image);
            this.showImage = true;
        }
    }


    removeImage(){
        if(confirm('Are you sure you want to remove this image?')){
            this.imageInput.nativeElement.value = null;
            this.imageActionKey = REMOVE_IMAGE_KEY;
            this.imageAction.nativeElement.value = this.imageActionKey;
            this.showImage = false;
        }
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue, true);
    }
}
