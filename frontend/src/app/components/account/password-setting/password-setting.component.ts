import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { get } from '../../../helpers/apiCalls';
import { getLoggedInUser } from '../../../helpers/helpers';
import { getUserUrl } from '../../../constants/api';
import { changePasswordUrl } from '../../../constants/api';
import { PostServices } from '../../../services/post.service';
import { CommonServices } from '../../../services/common.service';
import { RESPONSE_CODES, STORAGE_TOKENS } from '../../../constants/constants' ;


@Component({
	selector: 'app-password-setting',
	templateUrl: './password-setting.component.html',
	styleUrls: ['./password-setting.component.css']
})


export class PasswordSetting implements OnInit {
    @ViewChild('passwordChangeForm') passwordChangeForm: ElementRef;
    @ViewChild('confirmPassword') confirmPassword: ElementRef;
    @ViewChild('submitBtn') submitBtn: ElementRef;

    error: boolean = false;
    userId: number;
    userInfo: any;
    updateResponse: { status_code: number, message: string };
    updateSubscription: Subscription;


    constructor(
      private commonServices: CommonServices,
      private postServices: PostServices
    ) {
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                let error: boolean = true;
                this.updateResponse = {
                    status_code: updateResponse?.status_code,
                    message: updateResponse?.message
                }

                if(updateResponse?.status_code === RESPONSE_CODES.HTTP_200_OK){
                    error = false;
                    this.passwordChangeForm.nativeElement.reset();
                }

                this.error = error;
                this.submitBtn.nativeElement.removeAttribute('disabled');
            }
        );
    }


    async ngOnInit(): Promise<void> {
        this.updateResponse = { status_code: null, message: '' };
        this.userId = getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS)).userId;
        this.userInfo = await get(getUserUrl(this.userId));
    }


    async onSubmit(passwordChangeForm: NgForm): Promise<void> {
        this.submitBtn.nativeElement.setAttribute('disabled', 'disabled');

        const formControls = passwordChangeForm.form.controls;
        this.updateResponse.message = this.validatePassword(formControls);
        if(this.updateResponse.message){
            this.submitBtn.nativeElement.removeAttribute('disabled');
            return;
        }

        const data: Object = { email: this.userInfo.email};
        const inputElements = this.passwordChangeForm.nativeElement.elements;

        for(const inputEl of inputElements){
            if(inputEl.getAttribute('name')){
                const fieldName = inputEl.getAttribute('name');
                data[fieldName] = inputEl.value;
            }
        }

        await this.postServices.update(this.passwordChangeForm, data, changePasswordUrl);
    }


    validatePassword(formControls: any){
        if(formControls?.current_password?.value?.trim() === ''){
            this.error = true;
            return "Current password field is empty";
        }
        if(formControls?.new_password?.value?.length < 8){
            this.error = true;
            return "Password must be at least 8 characters long.";
        }
        if(formControls?.new_password?.value?.length > 512){
            this.error = true;
            return "Password must be less than 512 characters long.";
        }
        if(formControls?.new_password?.value !== formControls?.confirm_password?.value){
            this.error = true;
            return "New password and confirm password field do not match !";
        }
        return null;
    }
}
