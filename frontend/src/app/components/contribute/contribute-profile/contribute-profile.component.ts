import { Component, Input, OnInit } from '@angular/core';
import { getYears } from '../../../helpers/helpers';


@Component({
    selector: 'app-contribute-profile',
    templateUrl: './contribute-profile.component.html',
    styleUrls: ['./contribute-profile.component.css']
})


export class ContributeProfileComponent implements OnInit {
    @Input() formSeq: number;
    years: number[];


    constructor() { }

    
    ngOnInit(): void { 
        this.years = getYears(1990);
    }
}