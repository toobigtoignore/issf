import { Component, AfterViewInit, OnInit } from '@angular/core';
import { PANEL_CODES } from '../../../constants/constants';
import { getColorForPanel } from '../../../helpers/helpers';
import { counter } from '../../../helpers/helpers';


@Component({
    selector: 'app-record-counter',
    templateUrl: './record-counter.component.html',
    styleUrls: ['./record-counter.component.css']
})


export class RecordCounterComponent implements OnInit, AfterViewInit {
    panelCodes: PANEL_CODES = PANEL_CODES;
    initialRender: boolean = true;


    constructor() {
    }


    ngAfterViewInit(){
        this.initialRender = false;
    }


    ngOnInit(): void {
    }


    startCounter(element: HTMLElement, targetNumber: number) {
        if(this.initialRender){
            counter(element, targetNumber);
        }
    }


    getColorByRecordType(recordType: string){
        return getColorForPanel(recordType);
    }
}
