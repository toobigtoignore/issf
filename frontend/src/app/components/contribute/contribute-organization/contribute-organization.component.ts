import { Component, Input, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../../constants/api';
import { getYears } from '../../../helpers/helpers';


@Component({
    selector: 'app-contribute-organization',
    templateUrl: './contribute-organization.component.html',
    styleUrls: ['./contribute-organization.component.css']
})


export class ContributeOrganizationComponent implements OnInit {
    @Input() formSeq: number;
    countryList: string[];
    years: number[];


    constructor() { }


    ngOnInit(): void {
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
            this.years = getYears(1900);
        });
    }
}
