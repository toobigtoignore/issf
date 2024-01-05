import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { get } from '../../../helpers/apiCalls';
import { Contents } from '../../../services/contents.service';
import { AuthServices } from '../../../services/auth.service';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';
import { 
    DETAILS_ACCORDIONS_LABELS, 
    GS_OPTIONS, 
    PANEL_CODES,
    ORGANIZATION_TYPES
} from '../../../constants/constants'; 
import { 
    getAllOrganizationNamesUrl,
    getProfileRecordUrl,
    updateCharacteristicsUrl,
    updateProfileBasicUrl,
    updateProfileOrganizationUrl,
    updateProfilePercentage,
    updateExternalLinksUrl,
    updateSpeciesUrl,
    updateProfileSourcesCommentsUrl
} from '../../../constants/api';
import { SPECIES_LINKS_TYPES } from '../../../constants/constants';
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

    gsOptions: GS_OPTIONS;
    profileOrganizations: any;
    organizationList: string[];
    organizationTypes: string[];
    initialProfileOrganizationSection: any;
    species_link_types: SPECIES_LINKS_TYPES;
    tabLabels: string[];
    updateSubscription: Subscription;
    years: number[];

    
    constructor(
        private authServices: AuthServices,
        private commonServices: CommonServices,
        private contents: Contents,
        private postServices: PostServices
    ) { 
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                if(updateResponse.status === 'success'){
                    this.calculateProfilePercentage();
                }
            }
        );
    }

    
    async ngOnInit(): Promise<void> { 
        this.gsOptions = Object.values(GS_OPTIONS);
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['PROFILE']);
        this.species_link_types = SPECIES_LINKS_TYPES;
        this.years = getYears(1990);
        this.organizationTypes = ORGANIZATION_TYPES;
        this.profileOrganizations = this.record.organizations;
        if(this.profileOrganizations.length === 0){
            this.profileOrganizations = [['','','','','']];
        }
        this.organizationList = await get(getAllOrganizationNamesUrl);
    }

    
    ngAfterViewInit() { 
        const checkOrganizationList = () => {
            if(!this.organizationList) setTimeout(checkOrganizationList, 1000);
            else this.initialProfileOrganizationSection = document.getElementsByClassName('profile-organization-section')[0].cloneNode(true);
        }
        setTimeout(checkOrganizationList, 1000);
    }


    calculateProfilePercentage(){
        const excludeFields = [ "characteristics_label_list", "characteristics_value_list", "contributor_id", "contributor_name", "contributor_email", "contributor_affiliation", "contributor_country", "contribution_date", "who_link", "gs_region", "gs_local", "gs_subnation", "gs_national", "gs_global_notspecific" ];
        
        get(getProfileRecordUrl(this.recordId)).then(async (data: any) => {
            let fieldsFilled = 0;
            let totalFields = 0;
            const characteristicsKeys = Object.keys(data.characteristics_label_list);
            const fields = Object.keys(data);

            for(const field of fields){
                if(excludeFields.indexOf(field) === -1){
                    totalFields = totalFields + 1;
                    if(data[field]?.toString().length > 0){
                        fieldsFilled = fieldsFilled + 1;
                    }
                }
            }
            
            for(const index in characteristicsKeys){
                totalFields = totalFields + 1;
                if(data.characteristics_value_list[index]?.length > 0){
                    fieldsFilled = fieldsFilled + 1;
                }
            }
            
            const profilePercentage = {
                percent: Math.round((fieldsFilled * 100)/totalFields)
            };
            const token = await this.authServices.getToken();
            if(token){
                this.postServices.updateRecord(
                    profilePercentage, 
                    updateProfilePercentage(this.recordId), 
                    token
                ).subscribe(response => {
                    console.log(response)
                })
            }
        });
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
            panel: PANEL_CODES.PROFILE, 
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
        newSection.querySelector('[otherOrganizationTrigger]').addEventListener('change', (ev: Event) => this.toggleOnOther(ev, 'Other'));
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


    removeSection(event: Event){
        (event.target as HTMLElement).closest('.profile-organization-section').remove();
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue);
    }
}