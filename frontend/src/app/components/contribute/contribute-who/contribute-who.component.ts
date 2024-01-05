import { Component, Input, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl, getAllOrganizationNamesUrl } from '../../../constants/api';


@Component({
    selector: 'app-contribute-who',
    templateUrl: './contribute-who.component.html',
    styleUrls: ['./contribute-who.component.css']
})


export class ContributeWhoComponent implements OnInit {
    @Input() formSeq: number;
    countryList: string[];
    organizationList: string[];


    constructor() { }

    
    async ngOnInit(): Promise<void> { 
        this.countryList = await get(getAllCountriesUrl);
        this.organizationList = await get(getAllOrganizationNamesUrl);
    }
}