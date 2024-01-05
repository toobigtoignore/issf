import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, THEME_ISSUES_CATEGORIES } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
	selector: 'app-organization-details',
	templateUrl: './organization-details.component.html',
	styleUrls: ['./organization-details.component.css']
})


export class OrganizationDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    orgData: any;
    theme_issues_categories: THEME_ISSUES_CATEGORIES;


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.ORGANIZATION;
        this.theme_issues_categories = THEME_ISSUES_CATEGORIES;
        this.orgData = this.record;
    }


    getContributorName(){
        return this.orgData?.core?.user?.first_name + ' ' + this.orgData?.core?.user?.last_name;
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }


    lnToBr(value: any){
        if(value) return value.replaceAll('\n','<br>')
        return value;
    }
}
