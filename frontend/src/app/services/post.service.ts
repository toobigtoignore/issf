import { ElementRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PANEL_CODES } from '../constants/constants';
import { checkRequiredFields } from '../helpers/formInputFormatter';
import {
    createPersonRecordUrl,
    createSotaRecordUrl,
    createProfileRecordUrl,
    createOrganizationRecordUrl,
    createCasestudyRecordUrl,
    createGovernanceRecordUrl,
    createBluejusticeRecordUrl,
    createGuidelinesRecordUrl,
    deleteRecordUrl
 } from '../constants/api';
import { AuthServices } from './auth.service'
import { CommonServices } from './common.service';


@Injectable()


export class PostServices {

    constructor(
        private authServices: AuthServices,
        private commonServices: CommonServices,
        private http: HttpClient
    ){ }


    getApiUrlFromPanelCode(panelCode: string){
        switch(panelCode){
            case PANEL_CODES.WHO: return createPersonRecordUrl;
            case PANEL_CODES.SOTA: return createSotaRecordUrl;
            case PANEL_CODES.PROFILE: return createProfileRecordUrl;
            case PANEL_CODES.ORGANIZATION: return createOrganizationRecordUrl;
            case PANEL_CODES.CASESTUDY: return createCasestudyRecordUrl;
            case PANEL_CODES.GOVERNANCE: return createGovernanceRecordUrl;
            case PANEL_CODES.BLUEJUSTICE: return createBluejusticeRecordUrl;
            case PANEL_CODES.GUIDELINES: return createGuidelinesRecordUrl;
            default: break;
        }
    }


    setHeaders(token: string) {
        return new HttpHeaders({
            'Authorization': "Bearer " + token
        });
    }


    createRecord(panelCode: string, payload: Object): Observable<any> {
        const apiUrl = this.getApiUrlFromPanelCode(panelCode);
        return this.http.post(
            apiUrl, payload
        );
    }


    deleteRecord(recordId: number): Observable<any> {
        const apiUrl = deleteRecordUrl(recordId);
        return this.http.delete(apiUrl);
    }


    updateRecord(payload: Object, apiUrl: string, token: string): Observable<any> {
        return this.http.put(
            apiUrl, payload, {
                headers: this.setHeaders(token)
            }
        );
    }


    async update(formEl: ElementRef, formattedData: any, apiUrl: string, skipRequiredCheck: boolean = false){
        const requiredFieldsSatisfied = !skipRequiredCheck ? checkRequiredFields(formEl) : true;
        if(requiredFieldsSatisfied){
            const token = await this.authServices.getToken();
            if(token){
                this.updateRecord(formattedData, apiUrl, token)
                    .subscribe(response => {
                        if(response.status_code == 200) {
                            this.commonServices.updateEmitter.emit({
                                status: 'success',
                                message: 'Record updated successfully!!'
                            });
                        }
                        else alert("Something went wrong while trying to update the record. Please try again. If the issue persists, please contact us.");
                    });
            }
            else this.authServices.loginStatusEmitter.emit(true);
        }
        else {
            this.commonServices.updateEmitter.emit({
                status: 'error',
                message: 'Please fill up all the required fields'
            });
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }


    async formatAndUpdate(
        formType: string,
        params: { type: string, form: ElementRef, apiUrl: string }[],
        formattedData: any = null
    ){
        let form: ElementRef;
        let apiUrl: string;

        params.map((param) => {
            if(formType === param.type) {
                form = param.form;
                apiUrl = param.apiUrl;
            }
        });

        const requiredFieldsSatisfied = checkRequiredFields(form);

        if(requiredFieldsSatisfied){
            if(!formattedData || formattedData.length === 0) {
                // formattedData = formatFormValues(form);
            }
            const token = await this.authServices.getToken();
            if(token){
                this.updateRecord(formattedData, apiUrl, token)
                    .subscribe(response => {
                        if(response.status_code == 200) {
                            this.commonServices.updateEmitter.emit({
                                status: 'success',
                                message: 'Record updated successfully!!'
                            });
                        }
                        else alert("Something went wrong while trying to update the record. Please try again. If the issue persists, please contact us.");
                    });
            }
            else this.authServices.loginStatusEmitter.emit(true);
        }
        else {
            this.commonServices.updateEmitter.emit({
                status: 'error',
                message: 'Please fill up all the required fields'
            });
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}
