import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
    selector: 'app-guidelines-details',
    templateUrl: './guidelines-details.component.html',
    styleUrls: ['./guidelines-details.component.css']
})


export class GuidelinesDetailsComponent implements OnInit {
    @Input() accordion: string;
    @Input() record: any;
    accordionList: string[];
    guidelinesData: any;


    constructor(private formatterServices: FormatterServices) { }


    ngOnInit(): void {
        this.accordionList = DETAILS_ACCORDIONS_LABELS.GUIDELINES;
        this.guidelinesData = this.record;
    }


    getContributorName(){
        return this.guidelinesData?.core?.user?.first_name + ' ' + this.guidelinesData?.core?.user?.last_name;
    }


    getTimeframe(): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let beginDay: number, beginMonth: number, beginYear: number, endDay: number, endMonth: number, endYear: number, beginDate: string, endDate: string;

        if(this.guidelinesData.start_day && this.guidelinesData.start_day > 0) beginDay = this.guidelinesData.start_day;
        if(this.guidelinesData.start_month && this.guidelinesData.start_month > 0) beginMonth = this.guidelinesData.start_month;
        if(this.guidelinesData.start_year && this.guidelinesData.start_year > 0) beginYear = this.guidelinesData.start_year;

        if(this.guidelinesData.end_day && this.guidelinesData.end_day > 0) beginDay = this.guidelinesData.end_day;
        if(this.guidelinesData.end_month && this.guidelinesData.end_month > 0) beginMonth = this.guidelinesData.end_month;
        if(this.guidelinesData.end_year && this.guidelinesData.end_year > 0) beginYear = this.guidelinesData.end_year;

        if(beginYear){
            if(beginMonth){
                if(beginDay) beginDate = `${beginDay} ${months[beginMonth - 1]}, ${beginYear}`;
                else beginDate = `${months[beginMonth - 1]}, ${beginYear}`;
            }
            else beginDate = beginYear.toString();
        }

        if(endYear){
            if(endMonth){
                if(endDay) endDate = `${endDay} ${months[endMonth - 1]}, ${endYear}`;
                else endDate = `${months[endMonth - 1]}, ${endYear}`;
            }
            else endDate = endYear.toString();
        }

        if(!beginDate) return null;
        else{
            if(this.guidelinesData.ongoing = 'Yes') return `${beginDate} - Ongoing`;
            else{
                if(endDate) return `${beginDate} - ${endDate}`;
                return `${beginDate} (Closed)`;
            }
        }
    }


    getFormattedDate(date: string, delimiter: string): string {
        return this.formatterServices.formatDate(date, delimiter);
    }
}
