import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthServices } from '../../../services/auth.service';


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
    updateStatus: string;

    
    constructor(private authServices: AuthServices) { }

    
    ngOnInit(): void { }


    async onSubmit(passwordChangeForm: NgForm): Promise<void> {
        const formControls = passwordChangeForm.form.controls;
        this.updateStatus = this.validatePassword(formControls);
        if(this.updateStatus) return;
        
        const formValues = this.authServices.prepareSubmitData(formControls);
        delete formValues[this.confirmPassword.nativeElement.getAttribute('name')];
        
        const token = await this.authServices.getToken();
        if(token){
            this.submitBtn.nativeElement.setAttribute('disabled', 'disabled');
            this.authServices.changePassword(formValues, token).subscribe(
                response => {
                    this.updateStatus = 'Password updated successfully!';
                    this.error = false;
                    this.passwordChangeForm.nativeElement.reset();
                    this.submitBtn.nativeElement.removeAttribute('disabled')
                },
                err => {
                    this.error = true ;
                    if(err.error){
                        this.updateStatus = '';
                        for(const key of Object.keys(err.error)){
                            for(let errorMsg of err.error[key]){
                                if(errorMsg === 'Invalid password.') {
                                    errorMsg = 'Your current password does not match.'
                                }
                                this.updateStatus += "" + errorMsg + "<br>"
                            }
                        }
                    }
                    this.submitBtn.nativeElement.removeAttribute('disabled');
                }
            )
        }
        else this.submitBtn.nativeElement.removeAttribute('disabled');
    }


    validatePassword(formControls: any){
        if(formControls.new_password.value !== formControls.confirm_password.value){
            this.error = true;
            return "New password and confirm password field do not match !!";
        }
        if(formControls.new_password.value.length < 8){
            this.error = true;
            return "Password must be at least 8 characters long.";
        }
        return null;
    }
}