import { Component, Input, OnInit } from '@angular/core';
import { getYears, toggleOnSpecificValue } from '../../../helpers/helpers';
import { DEFINITE_ANS } from '../../../constants/constants';


@Component({
    selector: 'app-contribute-profile',
    templateUrl: './contribute-profile.component.html',
    styleUrls: ['./contribute-profile.component.css']
})


export class ContributeProfileComponent implements OnInit {
    @Input() formSeq: number;
    years: number[];
    definiteAns: DEFINITE_ANS = DEFINITE_ANS;
    definiteValues: string[];


    constructor() { }


    ngOnInit(): void {
        this.years = getYears(1990);
        this.definiteValues = Object.values(this.definiteAns);
    }


    toggler(event: Event, targetValue: string, otherValue: boolean = false){
        toggleOnSpecificValue(event, targetValue, otherValue);
    }
}
