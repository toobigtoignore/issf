import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getUserId } from '../../../helpers/helpers';
import { getAllCountriesUrl, getUserUrl, updateUserUrl } from '../../../constants/api';
import { JWT_TOKENS, PANEL_VALUES } from '../../../constants/constants';
import { PostServices } from '../../../services/post.service';
import { CommonServices } from '../../../services/common.service';
import { Subscription } from 'rxjs';
import { Contents } from '../../../services/contents.service';


@Component({
	selector: 'app-user-account',
	templateUrl: './user-account.component.html',
	styleUrls: ['./user-account.component.css']
})


export class UserAccountComponent implements OnInit {
    @ViewChild('accountForm') accountForm: ElementRef;
    @Input() usersContributions: any;
    showForm: Boolean = false;
    userId: number;
    userInfo: any;
    selectedCountry: string;
    countryList: string[];
    updateSubscription: Subscription;
    updateResponse: { status: string, message: string };
    contributionsByType: Object;
    recordTypes: string[];
    panelTitle = Object.values(PANEL_VALUES).slice(1);


    constructor(
        private contents: Contents,
        private postServices: PostServices,
        private commonServices: CommonServices
    ) {
        // this.updateSubscription = this.commonServices.updateEmitter.subscribe(
        //     (updateResponse: any) => {
        //         this.updateResponse = {
        //             status: updateResponse.status,
        //             message: updateResponse.message
        //         };
        //         if(updateResponse.status === 'success'){
        //             const selectEl = this.accountForm.nativeElement.querySelector('[name=country]');
        //             const countryName = selectEl.options[selectEl.selectedIndex].innerText;
        //             this.userInfo.first_name = this.accountForm.nativeElement.querySelector('[name=first_name]').value;
        //             this.userInfo.initials = this.accountForm.nativeElement.querySelector('[name=initials]').value;
        //             this.userInfo.last_name = this.accountForm.nativeElement.querySelector('[name=last_name]').value;
        //             this.userInfo.country_id = selectEl.value;
        //             this.userInfo.country_name = countryName;
        //             this.showForm = false;
        //         }
        // });
    }


    async ngOnInit(): Promise<void> {
        this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
        this.userInfo = await get(getUserUrl(this.userId));
        this.countryList = await get(getAllCountriesUrl);
        this.prepareNumberOfContributionsByType();
    }


    getPanelIcon(panelName: string): string {
        return this.contents.getPanelIconFromLabel(panelName);
    }


    prepareNumberOfContributionsByType() {
        this.panelTitle.map((recordType: string) => {
            this.contributionsByType = { ...this.contributionsByType, [recordType]: 0 };
        });

        const allContributions = [
            ...this.usersContributions.contributor_data,
            ...this.usersContributions.editor_data
        ];

        allContributions.map((record: Object) => {
            for(let title of this.panelTitle){
                if(title === record['core_record_type']){
                    this.contributionsByType[record['core_record_type']] += 1;
                    break;
                }
            }
        });

        this.recordTypes = Object.keys(this.contributionsByType);
    }


    async onAccountUpdate () {
        const data: Object = {};
        const inputElements = this.accountForm.nativeElement.elements;
        for(const inputEl of inputElements){
            if(inputEl.getAttribute('name')){
                const fieldName = inputEl.getAttribute('name');
                data[fieldName] = inputEl.value;
            }
        }
        data['email'] = this.userInfo.email;
        await this.postServices.update(this.accountForm, data, updateUserUrl);
    }
}
