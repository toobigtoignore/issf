import { Component, Input, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../../constants/api';


@Component({
    selector: 'app-contribute-case',
    templateUrl: './contribute-case.component.html',
    styleUrls: ['./contribute-case.component.css']
})


export class ContributeCaseComponent implements OnInit {
    @Input() formSeq: number;
    countryList: string[];


    constructor() { }

    
    ngOnInit(): void { 
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
        });
    }
}