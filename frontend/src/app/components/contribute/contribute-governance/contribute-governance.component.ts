import { Component, Input, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../../constants/api';


@Component({
    selector: 'app-contribute-governance',
    templateUrl: './contribute-governance.component.html',
    styleUrls: ['./contribute-governance.component.css']
})


export class ContributeGovernanceComponent implements OnInit {
    @Input() formSeq: number;
    countryList: string[];


    constructor() { }

    
    ngOnInit(): void { 
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
        });
    }
}