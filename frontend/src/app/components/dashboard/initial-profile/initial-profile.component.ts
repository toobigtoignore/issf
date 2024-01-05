import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { countryList } from '../../../../assets/js/types';
import { getAllCountriesUrl, getUserUrl, updateUserUrl } from '../../../constants/api';
import { getUserId } from '../../../helpers/helpers';
import { get } from '../../../helpers/apiCalls';
import { JWT_TOKENS } from '../../../constants/constants';
import { AuthServices } from '../../../services/auth.service';
import { CommonServices } from '../../../services/common.service';
import { PostServices } from '../../../services/post.service';
import { Subscription } from 'rxjs';


@Component({
	selector: 'app-initial-profile',
	templateUrl: './initial-profile.component.html',
	styleUrls: ['./initial-profile.component.css']
})


export class InitialProfileComponent implements OnInit {
    @ViewChild('userAccountForm') userAccountForm: ElementRef;
    @ViewChild('initialProfile') initialProfile: ElementRef;
	  accountUpdated: boolean = false;
    countryList: countryList[];
	  incompleteProfile: boolean = false;
	  isLoggedIn: boolean;
    updateResponse: { status: string, message: string };
    updateSubscription: Subscription;
    userId: number;
    userInfo: any;

    constructor(
        private authServices: AuthServices,
        private commonServices: CommonServices,
        private postServices: PostServices,
    ) {
        this.updateSubscription = this.commonServices.updateEmitter.subscribe(
            (updateResponse: any) => {
                if(updateResponse.status === 'success'){
                    this.accountUpdated = true;
                }
                this.updateResponse = {
                    status: updateResponse.status,
                    message: updateResponse.message
                }
        });
    }


    async ngOnInit(): Promise<void> {
		    this.isLoggedIn = this.authServices.isLoggedIn();
        if(this.isLoggedIn){
          this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
          get(getUserUrl(this.userId)).then(async (data: any) => {
              this.userInfo = data;
              if(!data.first_name || !data.last_name || !data.country_id){
                  this.incompleteProfile = true;
              }
              this.countryList = await get(getAllCountriesUrl);
          });
        }
    }


    removeModal(){
        this.initialProfile.nativeElement.remove();
    }


    async onUserProfileUpdate() {
        const data: Object = {};
        const inputElements = this.userAccountForm.nativeElement.elements;
        for(const inputEl of inputElements){
            if(inputEl.getAttribute('name')){
                const fieldName = inputEl.getAttribute('name');
                data[fieldName] = inputEl.value;
            }
        }
        data['email'] = this.userInfo.email;
        await this.postServices.update(this.userAccountForm, data, updateUserUrl);
    }
}
