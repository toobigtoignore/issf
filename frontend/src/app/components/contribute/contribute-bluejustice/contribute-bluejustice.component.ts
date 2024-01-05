import { Component, Input, OnInit } from '@angular/core';
import { getAllCountriesUrl } from '../../../constants/api';
import { get } from '../../../helpers/apiCalls';
import { countryList } from '../../../../assets/js/types';


@Component({
    selector: 'app-contribute-bluejustice',
    templateUrl: './contribute-bluejustice.component.html',
    styleUrls: ['./contribute-bluejustice.component.css']
})


export class ContributeBluejusticeComponent implements OnInit {
    @Input() formSeq: number;
    countryList: countryList[];

    
    constructor() { }

    
    ngOnInit(): void { 
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
        });
    }
}