import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../../services/auth.service';
import { RESPONSE_CODES } from '../../constants/constants';


@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})


export class RegistrationComponent implements OnInit {
    sigininSubscription: any;


    constructor(private authServices: AuthServices) {
        this.sigininSubscription = this.authServices.signinEmitter.subscribe((response: {message: string, status_code: number}) => {
            if(response.status_code === RESPONSE_CODES.HTTP_200_OK){
                window.location.href = '/';
            }
        });
    }


    ngOnInit(): void {

    }


    ngOnDestroy() {
        this.sigininSubscription.unsubscribe();
    }
}
