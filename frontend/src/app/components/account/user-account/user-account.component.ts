import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getLoggedInUser } from '../../../helpers/helpers';
import { getAllCountriesUrl, getUserUrl, updateUserUrl } from '../../../constants/api';
import { STORAGE_TOKENS, PANEL_VALUES, MONTHS, RESPONSE_CODES } from '../../../constants/constants';
import { parseDateElements } from '../../../helpers/helpers';
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
    updateResponse: { status_code: number, message: string };
    contributionsByType: Object;
    recordTypes: string[];
    panelTitle = Object.values(PANEL_VALUES).slice(1);
    responseCodes:RESPONSE_CODES = RESPONSE_CODES;


    constructor(
        private contents: Contents,
        private postServices: PostServices,
        private commonServices: CommonServices
    ) {
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                this.updateResponse = {
                    status_code: updateResponse.status_code,
                    message: updateResponse.message
                };
                if(updateResponse.status_code === RESPONSE_CODES.HTTP_200_OK){
                    const selectEl = this.accountForm.nativeElement.querySelector('[name=country_id]');
                    const countryName = selectEl.options[selectEl.selectedIndex].innerText;
                    this.userInfo.first_name = this.accountForm.nativeElement.querySelector('[name=first_name]').value;
                    this.userInfo.initials = this.accountForm.nativeElement.querySelector('[name=initials]').value;
                    this.userInfo.last_name = this.accountForm.nativeElement.querySelector('[name=last_name]').value;
                    this.userInfo.country_id = selectEl.value;
                    this.userInfo.country.short_name = countryName;
                    this.showForm = false;
                }
        });
    }


    async ngOnInit(): Promise<void> {
        this.userId = getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS)).userId;
        this.userInfo = await get(getUserUrl(this.userId));
        this.countryList = await get(getAllCountriesUrl);
        this.prepareNumberOfContributionsByType();
    }


    getFormattedDate(){
        const date = this.userInfo.date_joined.split(' ')[0];
        const parsedDate: {year: number, month: number, day: number} = parseDateElements(date, '-');
        const monthName = MONTHS.filter((month: {num: number, name: string, maxDay: number}) => parsedDate.month == month.num)[0].name;
        return parsedDate.day + ' ' + monthName + ', ' + parsedDate.year;
    }


    getFullName(){
        return this.userInfo.first_name + ' ' + (this.userInfo.initials || '') + ' ' + this.userInfo.last_name;
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
