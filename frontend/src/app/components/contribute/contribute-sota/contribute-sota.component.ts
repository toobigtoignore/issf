import { Component, Input, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../../constants/api';
import { SOTA_PUBLICATION_TYPES } from '../../../constants/constants';
import { getYears, toggleOnSpecificValue } from '../../../helpers/helpers';


@Component({
    selector: 'app-contribute-sota',
    templateUrl: './contribute-sota.component.html',
    styleUrls: ['./contribute-sota.component.css']
})


export class ContributeSotaComponent implements OnInit {
    @Input() formSeq: number;
    countryList: string[];
    years: number[];
    publicationTypes: SOTA_PUBLICATION_TYPES = SOTA_PUBLICATION_TYPES;


    constructor() { }


    async ngOnInit(): Promise<void> {
        this.years = getYears(1990);
        this.countryList = await get(getAllCountriesUrl);
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue);
    }
}
