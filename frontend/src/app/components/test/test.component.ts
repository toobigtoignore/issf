import { Component, OnInit } from '@angular/core';
// import { getTestValue } from '../../helpers/helpers';
import { CommonServices } from 'src/app/services/common.service';


@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})


export class TestComponent implements OnInit {
    formattedSummary: string = 'something';
    records: any;
    summaryList: any;

    // constructor(private commonServices: CommonServices) { }

    // fetchRecords() {
    //   // ... your API call logic
    //   this.records = [{
    //     id: 1,
    //     summary: 'summary 1'
    //   },{
    //     id: 2,
    //     summary: 'summary 2'
    //   },
    // ]

    //   this.summaryList = this.commonServices.getFormattedSummaries(this.records);
    //   console.log(this.summaryList);
    // }

    ngOnInit(): void {
    }
}
