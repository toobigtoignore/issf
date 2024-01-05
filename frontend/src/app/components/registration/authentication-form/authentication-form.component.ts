import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { get } from '../../../helpers/apiCalls';
import { getAllCountriesUrl } from '../../../constants/api';
import { REGISTRATION_ACTIONS, RESPONSE_CODES, RESPONSE_MESSAGE } from '../../../constants/constants';
import { AuthServices } from '../../../services/auth.service';
const MSG_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error'
};


@Component({
    selector: 'app-authentication-form',
    templateUrl: './authentication-form.component.html',
    styleUrls: ['./authentication-form.component.css']
})


export class AuthenticationFormComponent implements OnInit, AfterViewInit {
    @ViewChild('authenticationForm') authenticationForm: ElementRef;
    @ViewChild('responseEl') responseEl: ElementRef;
    @ViewChild('submitBtn') submitBtn: ElementRef;

    action: string;
    countryList: string[];
    insertedEmail: string;
    selectedActionType: string;
    responseMessage: string;
    registration_actions: REGISTRATION_ACTIONS;
    formRotation: number = 0;
    verificationCode: string;
    verificationLinkOption: boolean = false;
    paramsSubscription: Params;


    constructor(
        private authServices: AuthServices,
        private route: ActivatedRoute,
        private router: Router
    ) {
        if(this.authServices.isLoggedIn()){
            window.location.href = '/';
            return;
        }
    }


    async ngOnInit(): Promise<void> {
        this.registration_actions = REGISTRATION_ACTIONS;

        this.paramsSubscription = this.route.paramMap.subscribe(params => {
            this.action = params.get("action");
        });

        this.countryList = await get(getAllCountriesUrl);
    }


    ngAfterViewInit(): void {
        switch(this.action){
            case 'activated': this.setResponse(RESPONSE_MESSAGE.ACCOUNT_ACTIVATED, MSG_TYPE.SUCCESS); break;
            case 'activation-expired': {
                this.setResponse(RESPONSE_MESSAGE.ACTIVATION_TOKEN_EXPIRED, MSG_TYPE.ERROR);
                this.verificationLinkOption = true;
                break;
            }
            case 'password-updated': this.setResponse(RESPONSE_MESSAGE.PASSWORD_RESET_SUCCESSFUL, MSG_TYPE.SUCCESS); break;
            default: this.selectedActionType = REGISTRATION_ACTIONS.SIGNIN; break;
        }
    }


    ngOnDestroy() {
        if(this.paramsSubscription) this.paramsSubscription.unsubscribe();
    }


    allRequiredFieldsHaveValues(): boolean {
        let isFormValid: boolean = true;
        const requiredFields = Array.from(this.authenticationForm.nativeElement.querySelectorAll('[required]'));

        for(let field of requiredFields){
            const inputEl = field as HTMLFormElement;
            if(inputEl.value.trim() === ""){
                inputEl.classList.add('invalid-field');
                isFormValid = false;
            }

            else inputEl.classList.remove('invalid-field');
        }
        return isFormValid;
    }


    checkForErrors(data: Object, actionType: string){
        if(actionType === REGISTRATION_ACTIONS.SIGNUP || actionType === REGISTRATION_ACTIONS.RESET_PASSWORD){
            if(data['password'].length < 8) return RESPONSE_MESSAGE.INVALID_PASSWORD_LENGTH;
            else if(data['password'] !== data['confirm_password']) return RESPONSE_MESSAGE.PASSWORD_CONFIRMATION_MISMATCH;
        }

        else if(actionType === REGISTRATION_ACTIONS.SIGNIN){
            if(data['status'] === RESPONSE_CODES.HTTP_401_UNAUTHORIZED) return RESPONSE_MESSAGE.INVALID_CREDENTIALS;
            else return RESPONSE_MESSAGE.UNKNOWN_ERROR;
        }

        return null;
    }


    disableBtnShowSpinner(){
        const btnEl = this.submitBtn.nativeElement;
        btnEl.classList.add('disabled');
        btnEl.setAttribute('disabled', 'true');
        btnEl.querySelector('.spinner').removeAttribute('hidden');
    }


    forgotPasswordHandler(formData: any){
        this.authServices.forgotPassword({ 'email': formData.email }).subscribe(
            response => {
                if(response.success){
                    this.insertedEmail = formData.email;
                    this.verificationCode = response.verification_code;
                    this.selectedActionType = REGISTRATION_ACTIONS.VERIFY_CODE;
                    this.setResponse(RESPONSE_MESSAGE.PASSWORD_RESET_INSTRUCTION, MSG_TYPE.SUCCESS);
                }
                else{
                    if(response.errors?.invalid_email) this.setResponse(RESPONSE_MESSAGE.EMAIL_DOESNT_EXIST, MSG_TYPE.ERROR);
                    else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR);
                }
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
      )
    }


    getFormSpecificHeader(): string{
        if(this.selectedActionType === REGISTRATION_ACTIONS['SIGNUP']) return 'Sign Up';
        if(this.selectedActionType === REGISTRATION_ACTIONS['SIGNIN']) return 'Sign in';
        if(this.selectedActionType === REGISTRATION_ACTIONS['FORGOT_PASSWORD']) return 'Forgot Password';
        if(this.selectedActionType === REGISTRATION_ACTIONS['FORGOT_USERNAME']) return 'Get Username';
        if(this.selectedActionType === REGISTRATION_ACTIONS['RESEND_VERIFICATION_LINK']) return 'Get Verification Link';
        if(this.selectedActionType === REGISTRATION_ACTIONS['RESET_PASSWORD']) return 'New Password';
        if(this.selectedActionType === REGISTRATION_ACTIONS['VERIFY_CODE']) return 'Verify Code';
    }


    onSubmit(registrationForm: NgForm): void {
        this.verificationLinkOption = false;
        const formData = this.authServices.prepareSubmitData(registrationForm.form.controls);
        this.disableBtnShowSpinner();

        if(!this.allRequiredFieldsHaveValues()){
            this.setResponse(RESPONSE_MESSAGE.ALL_FIELDS_REQUIRED, MSG_TYPE.ERROR);
            return;
        }

        if(this.selectedActionType === REGISTRATION_ACTIONS['SIGNUP']) this.signUpHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['RESEND_VERIFICATION_LINK']) this.resendLinkHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['SIGNIN']) this.signinHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['FORGOT_USERNAME']) this.resetUsernameHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['FORGOT_PASSWORD']) this.forgotPasswordHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['VERIFY_CODE']) this.verifyCodeHandler(formData);
        else if(this.selectedActionType === REGISTRATION_ACTIONS['RESET_PASSWORD']) this.resetPasswordHandler(formData);
    }


    reEnableBtnHideSpinner(){
        const btnEl = this.submitBtn.nativeElement;
        btnEl.classList.remove('disabled');
        btnEl.removeAttribute('disabled');
        btnEl.querySelector('.spinner').setAttribute('hidden','true');
    }


    resendLinkHandler(formData: any){
        this.authServices.resendActivationLink({ 'email': formData.email }).subscribe(
            response => {
                if(response.success) this.setResponse(RESPONSE_MESSAGE.ACTIVATION_LINK_RESENT, MSG_TYPE.SUCCESS)
                else{
                    if(response.errors?.already_activated) this.setResponse(RESPONSE_MESSAGE.ACCOUNT_ALREADY_ACTIVATED, MSG_TYPE.ERROR);
                    else if(response.errors?.invalid_email) this.setResponse(RESPONSE_MESSAGE.EMAIL_DOESNT_EXIST, MSG_TYPE.ERROR);
                    else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR);
                }
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
        );
    }


    resetFormView(option: string): void {
        this.selectedActionType = option;

        // reset form design
        // this.formRotation += 360;
        // this.authenticationForm.nativeElement.style.transform = `rotateY(${this.formRotation}deg)`;

        this.responseMessage = null;
        this.verificationLinkOption = false;
        Array.from(this.authenticationForm.nativeElement.querySelectorAll('[required]'))
            .forEach(element =>
                (element as HTMLElement).classList.remove('invalid-field')
            );
    }


    resetPasswordHandler(formData: any): void {
        const errorMessage = this.checkForErrors(formData, this.selectedActionType);
        if(errorMessage){
            this.setResponse(errorMessage, MSG_TYPE.ERROR);
            return;
        }

        const payload = {
            email: this.insertedEmail,
            password: formData.password
        };

        this.authServices.resetPassword(payload).subscribe(
            response => {
                if(response.success){
                    this.router.navigate(['/registration/password-updated']);
                }
                else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
        );
    }


    resetUsernameHandler(formData: any){
        this.authServices.sendUsername({ 'email': formData.email }).subscribe(
            response => {
                if(response.success) this.setResponse(RESPONSE_MESSAGE.USERNAME_INSTRUCTION, MSG_TYPE.SUCCESS);
                else {
                    if(response.errors?.user_not_active) this.setResponse(RESPONSE_MESSAGE.ACCOUNT_IS_NOT_ACTIVE, MSG_TYPE.ERROR);
                    else if(response.errors?.invalid_email) this.setResponse(RESPONSE_MESSAGE.EMAIL_DOESNT_EXIST, MSG_TYPE.ERROR);
                    else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR);
                }
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
        );
    }


    setResponse(msgToSet: string, msgType: string){
        const responseElClassList = this.responseEl.nativeElement.classList;
        if(msgType === MSG_TYPE.SUCCESS) responseElClassList.add('success');
        else responseElClassList.remove('success');

        this.responseMessage = msgToSet;

        // re-enable button again
        this.reEnableBtnHideSpinner();
    }


    signinHandler(formData: any){
        this.authServices.login(formData).subscribe(
            response => {
                if(response.success && response.token) {
                    this.authServices.setLoginTokens(response.token);
                    window.location.href = '/';
                }
                else{
                    if(response.errors?.validation_failed?.username) this.setResponse(RESPONSE_MESSAGE.USERNAME_DOESNT_EXIST, MSG_TYPE.ERROR);
                    else if(response.errors?.wrong_credentials) this.setResponse(RESPONSE_MESSAGE.CREDENTIAL_ERRORS, MSG_TYPE.ERROR);
                    else if(response.errors?.password_expired) this.setResponse(RESPONSE_MESSAGE.PASSWORD_EXPIRED, MSG_TYPE.ERROR);
                    else if(response.errors?.user_not_active) {
                        this.setResponse(RESPONSE_MESSAGE.ACCOUNT_IS_NOT_ACTIVE, MSG_TYPE.ERROR);
                        this.verificationLinkOption = true;
                    }
                    else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR);
                }
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
        );
    }


    signUpHandler(formData: any){
        const errorMessage = this.checkForErrors(formData, this.selectedActionType);

        if(errorMessage){
            this.setResponse(errorMessage, MSG_TYPE.ERROR);
            return;
        }

        delete formData['confirm_password'];
        this.authServices.signup(formData).subscribe(
            (response) => {
                if(response.success) this.setResponse(RESPONSE_MESSAGE.SIGN_UP_SUCCESSFULL, MSG_TYPE.SUCCESS)
                else {
                    if(response.errors?.validation?.email) this.setResponse(RESPONSE_MESSAGE.EMAIL_ALREADY_EXISTS, MSG_TYPE.ERROR)
                    else if(response.errors?.validation?.username) this.setResponse(RESPONSE_MESSAGE.USERNAME_ALREADY_EXISTS, MSG_TYPE.ERROR)
                    else this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR);
                }
            },
            () => this.setResponse(RESPONSE_MESSAGE.UNKNOWN_ERROR, MSG_TYPE.ERROR)
        );
    }


    verifyCodeHandler(formData:any){
        if(formData.verification_code.trim() === this.verificationCode.trim()){
            this.selectedActionType = REGISTRATION_ACTIONS.RESET_PASSWORD;
            this.setResponse(RESPONSE_MESSAGE.PASSWORD_VERIFICATION_CODE_MATCHED, MSG_TYPE.SUCCESS);
            return;
        }

        this.selectedActionType = REGISTRATION_ACTIONS.FORGOT_PASSWORD;
        this.setResponse(RESPONSE_MESSAGE.PASSWORD_VERIFICATION_CODE_MISMATCHED, MSG_TYPE.ERROR);
    }
}
