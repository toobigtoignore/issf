import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, STORAGE_TOKENS, THEME_ISSUES_CATEGORIES } from '../../../constants/constants';
import { getCountryNameFromCode } from '../../../helpers/helpers';
import { getLoggedInUser } from '../../../helpers/helpers';
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
    affiliatedOrganizations: any;
    primaryAffiliation: any;
    notRegisteredAffiliation: string;
    theme_issues_categories: THEME_ISSUES_CATEGORIES;
    whoData: any;
    userId: number;
    profileMenu: Element = document.querySelector('[userProfileMenu]')


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.WHO;
        this.whoData = this.record;
        this.theme_issues_categories = THEME_ISSUES_CATEGORIES;
        this.userId = getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS)).userId;
        this.primaryAffiliation = this.whoData.organizations?.filter(org => !!org.is_primary_affiliation)[0];
        this.affiliatedOrganizations = this.whoData.organizations?.filter(org => org.organization_id !== this.primaryAffiliation?.organization_id);

        if(!this.primaryAffiliation || this.primaryAffiliation.length === 0){
            this.notRegisteredAffiliation = this.record.affiliation || null;
            if(this.notRegisteredAffiliation){
                this.notRegisteredAffiliation += this.record.address1;
                this.record.city_town && this.record.city_town !== '' ? this.notRegisteredAffiliation += ', ' + this.record.city_town : '';
                this.record.prov_state && this.record.prov_state !== '' ? this.notRegisteredAffiliation += ', ' + this.record.prov_state : '';
                this.record.affiliated_organization_country && this.record.affiliated_organization_country !== '' ? this.notRegisteredAffiliation += ', ' + this.record.affiliated_organization_country.short_name : '';
                this.record.postal_code && this.record.postal_code !== '' ? this.notRegisteredAffiliation += ', ' + this.record.postal_code : '';
            }
        }

        if(this.whoData.core?.contributor?.id == this.userId){
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
