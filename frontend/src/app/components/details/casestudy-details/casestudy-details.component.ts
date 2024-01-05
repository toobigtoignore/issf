import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
    selector: 'app-casestudy-details',
    templateUrl: './casestudy-details.component.html',
    styleUrls: ['./casestudy-details.component.css']
})


export class CasestudyDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    caseData: any;


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.CASESTUDY;
        this.caseData = this.record;
    }


    getContributorName(){
        return this.caseData?.core?.user?.first_name + ' ' + this.caseData?.core?.user?.last_name;
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }
}
