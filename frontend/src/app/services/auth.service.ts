import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JWT_TOKENS } from '../constants/constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { get } from '../helpers/apiCalls';
import { loginAccessToken } from '../../assets/js/types';
import {
    checkLoginStatusUrl,
    changePasswordUrl,
    forgotPasswordUrl,
    forgotUsernameUrl,
    loginUrl,
    logoutUrl,
    refreshTokenUrl,
    resetPasswordUrl,
    resendActivationLinkUrl,
    signupUrl,
    usernameEmailValidityUrl
} from '../constants/api';


@Injectable()


export class AuthServices {
    signinEmitter = new EventEmitter<any>();
    loginStatusEmitter = new EventEmitter<boolean>();

    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
     });


    constructor(private http: HttpClient){ }


    signup(payload: Object): Observable<any> {
        return this.http.post(signupUrl, payload);
    }


    login(payload: Object): Observable<any> {
        return this.http.post(loginUrl, payload);
    }


    logout(){
        this.removeLoginTokens();
        return;
    }


    setLoginTokens(token: string) {
        localStorage.setItem(JWT_TOKENS.ACCESS, token);
    }


    forgotPassword(payload: Object): Observable<any> {
        return this.http.post(forgotPasswordUrl, payload);
    }


    removeLoginTokens() {
        localStorage.removeItem(JWT_TOKENS.ACCESS);
    }


    isLoggedIn(): boolean {
        const accessToken = localStorage.getItem(JWT_TOKENS.ACCESS);
        if(accessToken && this.isTokenValid(accessToken)){
            return true;
        }
        return false;
    }


    async isLoggedIn2(): Promise<boolean> {
        const accessToken = localStorage.getItem(JWT_TOKENS.ACCESS);
        console.log(accessToken);
        if(accessToken){
            console.log('access token validity: ', this.isTokenValid(accessToken));
            if(this.isTokenValid(accessToken)) return true;
            else{
                console.log('access token not valid');
                const decodedToken: loginAccessToken = this.decodedToken(accessToken);
                console.log("decodedToken: ", decodedToken);
                const newToken = await get(checkLoginStatusUrl(decodedToken.user_id, decodedToken.jti));
                console.log("new token: ", newToken);
                if(newToken){
                    localStorage.setItem(JWT_TOKENS.ACCESS, newToken);
                    return true;
                }
                // else this.logout();
                return false;
            }
        }
        console.log("bye 2");
        return false;
    }


    changePassword(payload: Object, token: string): Observable<any> {
        return this.http.post(
            changePasswordUrl, payload, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                 })
            }
        );
    }


    async getToken(): Promise<string> {
        const accessToken = localStorage.getItem(JWT_TOKENS.ACCESS);
        const refreshToken = localStorage.getItem(JWT_TOKENS.REFRESH);
        const payload = {
            [JWT_TOKENS.REFRESH]: refreshToken
        };

        if(this.isTokenValid(refreshToken)){
            if(this.isTokenValid(accessToken)) return accessToken;
            else{
                const token = await this.http.post(
                    refreshTokenUrl, payload, {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + accessToken
                        })
                    }
                ).toPromise();
                return token[JWT_TOKENS.ACCESS];
            }
        }
        return null;
    }


    isTokenValid(token: string): boolean {
        const tokenHelper = new JwtHelperService();
        const isExpired = tokenHelper.isTokenExpired(token);
        if(!isExpired) return true;
        return false;
    }


    decodedToken(token: string): loginAccessToken {
        return (new JwtHelperService()).decodeToken(token);
    }


    resetPassword(payload: Object): Observable<any> {
        return this.http.post(resetPasswordUrl, payload);
    }


    resendActivationLink(payload: Object): Observable<any> {
        return this.http.post(resendActivationLinkUrl, payload);
    }


    sendUsername(payload: Object): Observable<any> {
        return this.http.post(forgotUsernameUrl, payload);
    }


    prepareSubmitData(obj: Object): Object {
        const result = {};
        for (const [key, valueField] of Object.entries(obj)){
            result[key] = valueField.value;
        }
        return result;
    }
}
