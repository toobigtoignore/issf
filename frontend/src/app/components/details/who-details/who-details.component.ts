import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, JWT_TOKENS, THEME_ISSUES_CATEGORIES } from '../../../constants/constants';
import { getCountryNameFromCode } from '../../../helpers/helpers';
import { getUserId } from '../../../helpers/helpers';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
	selector: 'app-who-details',
	templateUrl: './who-details.component.html',
	styleUrls: ['./who-details.component.css']
})


export class WhoDetailsComponent implements OnInit, OnDestroy {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    theme_issues_categories: THEME_ISSUES_CATEGORIES;
    whoData: any;
    userId: number;
    profileMenu: Element = document.querySelector('[userProfileMenu]')


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.WHO;
        this.whoData = this.record;
        this.theme_issues_categories = THEME_ISSUES_CATEGORIES;
        this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
        if(this.whoData.core.user.id == this.userId){
            this.profileMenu?.classList?.add('menu-active');
        }
    }


    ngOnDestroy(): void {
        this.profileMenu?.classList?.remove('menu-active');
    }


    formulateFullName(user: any){
        const initials = user.initials || '';
        const fullname = user.first_name + ' ' +  initials + ' ' + user.last_name;
        return fullname.trim();
    }


    getCountryName(country_id: number){
        return getCountryNameFromCode(country_id);
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }


    lnToBr(value: any){
        if(value) return value.replaceAll('\n','<br>')
        return value;
    }
}
