import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, DEFINITE_ANS } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';
import { adjustValueWithUnit } from '../../../helpers/helpers';


@Component({
    selector: 'app-profile-details',
    templateUrl: './profile-details.component.html',
    styleUrls: ['./profile-details.component.css']
})


export class ProfileDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    definiteAns: DEFINITE_ANS;
    accordionList: string[];
    profileData: any;


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.PROFILE;
        this.definiteAns = DEFINITE_ANS;
        this.profileData = this.record;
    }


    adjustValueWithUnit(item: {value: string, unit: string|null, additional: number|null}): string {
        return adjustValueWithUnit(item);
    }


    getContributorName(){
        return this.profileData?.core?.contributor?.first_name + ' ' + this.profileData?.core?.contributor?.last_name;
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }


    lnToBr(value: any){
        if(value) return value.replaceAll('\n','<br>')
        return value;
    }
}
