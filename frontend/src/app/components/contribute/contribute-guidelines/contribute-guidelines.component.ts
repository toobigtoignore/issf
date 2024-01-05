import { Component, Input, OnInit } from '@angular/core';
import { Contents } from '../../../services/contents.service';
import { GUIDELINES_ACTIVITY_TYPE, GUIDELINES_ACTIVITY_COVERAGE } from '../../../constants/constants';
import { getYears, toggleOnSpecificValue } from '../../../helpers/helpers';


@Component({
    selector: 'app-contribute-guidelines',
    templateUrl: './contribute-guidelines.component.html',
    styleUrls: ['./contribute-guidelines.component.css']
})


export class ContributeGuidelinesComponent implements OnInit {
    @Input() formSeq: number;
    years: number[];
    months: {num: number, name: string, day: number}[];
    activityType: GUIDELINES_ACTIVITY_TYPE = GUIDELINES_ACTIVITY_TYPE;
    activityCoverage: GUIDELINES_ACTIVITY_COVERAGE = GUIDELINES_ACTIVITY_COVERAGE;
    

    constructor(private contents: Contents) { }

    
    ngOnInit(): void {
        this.years = getYears(1900);
        this.months = this.contents.getMonths();
    }
    
    
    counter(num: number) {
        return new Array(num);
    }

    
    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue);
    }
}