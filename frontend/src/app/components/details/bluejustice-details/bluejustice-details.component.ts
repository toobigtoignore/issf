import { Component, Input, OnInit } from '@angular/core';
import { DEFINITE_ANS, DETAILS_ACCORDIONS_LABELS } from '../../../constants/constants';


@Component({
    selector: 'app-bluejustice-details',
    templateUrl: './bluejustice-details.component.html',
    styleUrls: ['./bluejustice-details.component.css']
})


export class BluejusticeDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    bluejusticeData: any;
    definiteAns: DEFINITE_ANS = DEFINITE_ANS;


    constructor() { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.BLUEJUSTICE;
        this.bluejusticeData = this.record;
    }


    getContributorName(){
        return this.bluejusticeData?.core?.user?.first_name + ' ' + this.bluejusticeData?.core?.user?.last_name;
    }


    lnToBr(value: any){
        if(value) return value.replaceAll('\n','<br>')
        return value;
    }
}
