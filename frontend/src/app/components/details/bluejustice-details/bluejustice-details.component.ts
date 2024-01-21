import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
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
    imageUrl: string = environment.BLUEJUSTICE_IMAGE_URL;


    constructor() { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.BLUEJUSTICE;
        this.bluejusticeData = this.record;
    }


    getContributorName(){
        return this.bluejusticeData?.core?.contributor?.first_name + ' ' + this.bluejusticeData?.core?.contributor?.last_name;
    }


    lnToBr(value: any){
        if(value) return value.replaceAll('\n','<br>')
        return value;
    }
}
