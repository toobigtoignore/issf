import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, PANEL_CODES } from '../../../constants/constants';
import { 
    updateCaseStudiesBasicUrl,
    updateCaseStudiesDescriptionUrl,
    updateCaseStudiesSolutionUrl 
} from '../../../constants/api';
import { formatFormValues } from '../../../helpers/formInputFormatter';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';


@Component({
    selector: 'app-update-casestudies',
    templateUrl: './update-casestudies.component.html',
    styleUrls: ['./update-casestudies.component.css']
})


export class UpdateCasestudiesComponent implements OnInit {
    @ViewChild('basicForm') basicForm: ElementRef;
    @ViewChild('descriptionForm') descriptionForm: ElementRef;
    @ViewChild('solutionForm') solutionForm: ElementRef;
    @Input() activeTab: string;
    @Input() record: any;
    @Input() recordId: number;

    tabLabels: string[];

    
    constructor(
        private commonServices: CommonServices,
        private postServices: PostServices
    ) { }

    
    ngOnInit(): void {         
        this.tabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['CASESTUDY']);
    }


    async onCaseStudiesUpdate(){
        const formType: string = this.activeTab;
        let form: ElementRef;
        let apiUrl: string;

        switch(formType){
            case this.tabLabels[0]: { form = this.basicForm; apiUrl = updateCaseStudiesBasicUrl(this.recordId); break; }
            case this.tabLabels[1]: { form = this.descriptionForm; apiUrl = updateCaseStudiesDescriptionUrl(this.recordId); break; }
            case this.tabLabels[2]: { form = this.solutionForm; apiUrl = updateCaseStudiesSolutionUrl(this.recordId); break; }
            default: break;
        };

        const formatted: any = formatFormValues({ 
            panel: PANEL_CODES.CASESTUDY, 
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
}