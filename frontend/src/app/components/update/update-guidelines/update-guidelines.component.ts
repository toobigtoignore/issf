import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Contents } from '../../../services/contents.service';
import { DETAILS_ACCORDIONS_LABELS, PANEL_CODES } from '../../../constants/constants';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { updateGuidelinesRecordUrl } from '../../../constants/api';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';
import { getYears, parseDateElements, toggleOnSpecificValue } from '../../../helpers/helpers';


@Component({
    selector: 'app-update-guidelines',
    templateUrl: './update-guidelines.component.html',
    styleUrls: ['./update-guidelines.component.css']
})


export class UpdateGuidelinesComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;

    tabLabels: string[];
    years: number[];
    months: {num: number, name: string, day: number}[];


    constructor(
        private commonServices: CommonServices,
        private contents: Contents,
        private postServices: PostServices
    ) { }


    ngOnInit(): void {
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['GUIDELINES']);
        this.years = getYears(1990);
        this.months = this.contents.getMonths();
    }


    counter(num: number) {
        return new Array(num);
    }


    async onGuidelinesUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateGuidelinesRecordUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({
            panel: PANEL_CODES.GUIDELINES,
            formType: formType,
            formElement: form
        });
        const { data, errorMsg } = formatted;
        if(errorMsg) {
            this.commonServices.updateEmitter.emit({
                status: 'error',
                message: errorMsg
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        await this.postServices.update(form, data, apiUrl);
    }


    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue);
    }
}
