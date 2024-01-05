import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
    selector: 'app-governance-details',
    templateUrl: './governance-details.component.html',
    styleUrls: ['./governance-details.component.css']
})


export class GovernanceDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    governanceData: any;

    
    constructor(private formatterServices: FormatterServices) { }

    
    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.GOVERNANCE;
        this.governanceData = this.record;
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }
}
