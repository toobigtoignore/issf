import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { get } from '../../../helpers/apiCalls';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';
import {
    DEFINITE_ANS,
    DETAILS_ACCORDIONS_LABELS,
    GS_OPTIONS,
    PANEL_CODES,
    ORGANIZATION_TYPES,
    RESPONSE_CODES
} from '../../../constants/constants';
import {
    getAllOrganizationsUrl,
    updateCharacteristicsUrl,
    updateProfileBasicUrl,
    updateProfileOrganizationUrl,
    updateExternalLinksUrl,
    updateSpeciesUrl,
    updateProfileSourcesCommentsUrl
} from '../../../constants/api';
import {
    KEEP_IMAGE_KEY,
    MAX_FILE_SIZE,
    REMOVE_IMAGE_KEY,
    SPECIES_LINKS_TYPES,
    UPLOAD_IMAGE_KEY
} from '../../../constants/constants';
import { environment } from '../../../../environments/environment';
import { getYears, toggleOnSpecificValue } from '../../../helpers/helpers';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-update-profile',
    templateUrl: './update-profile.component.html',
    styleUrls: ['./update-profile.component.css']
})


export class UpdateProfileComponent implements OnInit, AfterViewInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('characteristicsForm') characteristicsForm: ElementRef;
    @ViewChild('imageAction') imageAction: ElementRef;
    @ViewChild('imageInput') imageInput: ElementRef;
    @ViewChild('previewImage') previewImage: ElementRef;
    @ViewChild('speciesForm') speciesForm: ElementRef;
    @ViewChild('profileOrganizationForm') profileOrganizationForm: ElementRef;
    @ViewChild('profileOrganizationSection') profileOrganizationSection: ElementRef;
    @ViewChild('linksForm') linksForm: ElementRef;
    @ViewChild('organizationFromList') organizationFromList: ElementRef;
    @ViewChild('addNewOrganization') addNewOrganization: ElementRef;
    @ViewChild('sourcesForm') sourcesForm: ElementRef;


    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;

    definiteAns: DEFINITE_ANS = DEFINITE_ANS;
    definiteValues: string[];
    fileTooBigError: boolean = false;
    gsOptions: GS_OPTIONS;
    image: File;
    imageActionKey: string = KEEP_IMAGE_KEY;
    imageUrl: string = environment.SSF_PROFILE_IMAGE_URL;
    profileOrganizations: any;
    organizationList: string[];
    organizationTypes: string[];
    initialProfileOrganizationSection: any;
    showImage: boolean = false;
    species_link_types: SPECIES_LINKS_TYPES;
    tabLabels: string[];
    updateSubscription: Subscription;
    years: number[];


    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) {
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                if(updateResponse.status_code === RESPONSE_CODES.HTTP_200_OK){
                    this.calculateProfilePercentage();
                }
            }
        );
    }


    async ngOnInit(): Promise<void> {
        this.definiteValues = Object.values(this.definiteAns);
        this.gsOptions = Object.values(GS_OPTIONS);
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['PROFILE']);
        this.species_link_types = SPECIES_LINKS_TYPES;
        this.years = getYears();
        this.organizationTypes = ORGANIZATION_TYPES;
        this.profileOrganizations = this.record.organizations;
        if(this.profileOrganizations.length === 0){
            this.profileOrganizations = [{
                enlisted: true,
                name: null,
                type: null,
                other: null,
                geoscope: null
            }];
        }
        this.organizationList = await get(getAllOrganizationsUrl);
        this.showImage = this.record.img !== null && this.record.img !== '';
    }


    ngAfterViewInit() {
        const checkOrganizationList = () => {
            if(!this.organizationList) setTimeout(checkOrganizationList, 1000);
            else this.initialProfileOrganizationSection = document.getElementsByClassName('profile-organization-section')[0].cloneNode(true);
        }
        setTimeout(checkOrganizationList, 1000);
    }


    calculateProfilePercentage(){
        // const excludeFields = [ "characteristics_label_list", "characteristics_value_list", "contributor_id", "contributor_name", "contributor_email", "contributor_affiliation", "contributor_country", "contribution_date", "who_link", "gs_region", "gs_local", "gs_subnation", "gs_national", "gs_global_notspecific" ];

        // get(getProfileRecordUrl(this.recordId)).then(async (data: any) => {
        //     let fieldsFilled = 0;
        //     let totalFields = 0;
        //     const characteristicsKeys = Object.keys(data.characteristics_label_list);
        //     const fields = Object.keys(data);

        //     for(const field of fields){
        //         if(excludeFields.indexOf(field) === -1){
        //             totalFields = totalFields + 1;
        //             if(data[field]?.toString().length > 0){
        //                 fieldsFilled = fieldsFilled + 1;
        //             }
        //         }
        //     }

        //     for(const index in characteristicsKeys){
        //         totalFields = totalFields + 1;
        //         if(data.characteristics_value_list[index]?.length > 0){
        //             fieldsFilled = fieldsFilled + 1;
        //         }
        //     }

        //     const profilePercentage = {
        //         percent: Math.round((fieldsFilled * 100)/totalFields)
        //     };
        //     const token = await this.authServices.getToken();
        //     if(token){
        //         this.postServices.updateRecord(
        //             profilePercentage,
        //             updateProfilePercentage(this.recordId)
        //         ).subscribe(response => {
        //             console.log(response)
        //         })
        //     }
        // });
    }


    async onProfileUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateProfileBasicUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.characteristicsForm; apiUrl = updateCharacteristicsUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.speciesForm; apiUrl = updateSpeciesUrl(this.recordId); break; }
            case this.tabLabels[3]: { form = this.profileOrganizationForm; apiUrl = updateProfileOrganizationUrl(this.recordId); break; }
            case this.tabLabels[4]: { form = this.linksForm; apiUrl = updateExternalLinksUrl(this.recordId); break; }
            case this.tabLabels[5]: { form = this.sourcesForm; apiUrl = updateProfileSourcesCommentsUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({
            recordType: PANEL_CODES.PROFILE,
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


    onAddAnother(event: Event){
        const bindEvent = (element: any) => {
            const organizationExist = element.hasAttribute('organizationFromList') ? 'true' : 'false';
            element.addEventListener('click', (ev: Event) => this.onOrganizationTypeSelect(ev, organizationExist));
        };

        const el = event.target as HTMLElement;
        const profileOrganizationSectionContainer = (el.previousElementSibling as HTMLElement);

        this.initialProfileOrganizationSection.querySelector("[organizationExist='true']").classList.remove('hidden');
        this.initialProfileOrganizationSection.querySelector("[organizationExist='false']").classList.add('hidden');
        this.initialProfileOrganizationSection.querySelector("[organizationFromList]").querySelector("[checked]").classList.remove('hidden');
        this.initialProfileOrganizationSection.querySelector("[organizationFromList]").querySelector("[unchecked]").classList.add('hidden');
        this.initialProfileOrganizationSection.querySelector("[addNewOrganization]").querySelector("[checked]").classList.add('hidden');
        this.initialProfileOrganizationSection.querySelector("[addNewOrganization]").querySelector("[unchecked]").classList.remove('hidden');

        profileOrganizationSectionContainer.insertAdjacentHTML("beforeend", this.initialProfileOrganizationSection.outerHTML);

        const newSection = (el.previousElementSibling.lastElementChild as HTMLElement);
        newSection.querySelector('[sectionRemover]').addEventListener('click', (ev: Event) => this.removeSection(ev));
        (newSection.querySelector('[toggleDisable]') as HTMLElement).style.display = 'none';
        newSection.querySelector('[otherOrganizationTrigger]').addEventListener('change', (ev: Event) => this.toggler(ev, 'Other', true));
        const triggers = newSection.querySelectorAll('[trigger]');
        triggers.forEach(bindEvent);
    }


    onOrganizationTypeSelect(event: Event, organizationStatus: string){
        const status = organizationStatus === 'true';
        const element = event.target as HTMLElement;
        const organizationExistSection: HTMLElement = element.closest('[profileOrganizationSection]').querySelector("[organizationExist='true']");
        const organizationDoesNotExistSection: HTMLElement = element.closest('[profileOrganizationSection]').querySelector("[organizationExist='false']");
        const checkedElement: HTMLElement = element.querySelector('[checked]');
        const uncheckedElement: HTMLElement = element.querySelector('[unchecked]');
        const removeRequired = (element: any) => element.removeAttribute('required');
        const addRequired = (element: any) => element.setAttribute('required','true');
        if(status === true){
            organizationExistSection.setAttribute('isActive','true');
            organizationDoesNotExistSection.removeAttribute('isActive');
            organizationExistSection.style.display = 'block';
            organizationDoesNotExistSection.style.display = 'none';
            checkedElement.style.display = 'block';
            uncheckedElement.style.display = 'none';
            (element.nextElementSibling.querySelector('[checked]') as HTMLElement).style.display = 'none';
            (element.nextElementSibling.querySelector('[unchecked]') as HTMLElement).style.display = 'block';
            organizationExistSection.querySelectorAll('[mayRequireInput]').forEach(addRequired);
            organizationDoesNotExistSection.querySelectorAll('[required]').forEach(removeRequired);
        }
        else{
            organizationDoesNotExistSection.setAttribute('isActive','true');
            organizationExistSection.removeAttribute('isActive');
            organizationExistSection.style.display = 'none';
            organizationDoesNotExistSection.style.display = 'block';
            checkedElement.style.display = 'block';
            uncheckedElement.style.display = 'none';
            (element.previousElementSibling.querySelector('[checked]') as HTMLElement).style.display = 'none';
            (element.previousElementSibling.querySelector('[unchecked]') as HTMLElement).style.display = 'block';
            organizationExistSection.querySelectorAll('[required]').forEach(removeRequired);
            organizationDoesNotExistSection.querySelectorAll('[mayRequireInput]').forEach(addRequired);
        }
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


    removeSection(event: Event){
        (event.target as HTMLElement).closest('.profile-organization-section').remove();
    }


    toggler(event: Event, targetValue: string, otherValue: boolean = false){
        toggleOnSpecificValue(event, targetValue, otherValue);
    }
}
