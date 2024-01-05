import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { get } from '../../../helpers/apiCalls';
import { getUserId } from '../../../helpers/helpers';
import { getPersonLinkForUserUrl } from '../../../constants/api';
import { GS_OPTIONS, JWT_TOKENS, PANEL_CODES, PANEL_VALUES, RESPONSE_CODES } from '../../../constants/constants';
import { AuthServices } from '../../../services/auth.service';
import { PostServices } from '../../../services/post.service';


@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.css']
})


export class UserProfileComponent implements OnInit {
    userId: number;

    constructor(
        private authServices: AuthServices,
        private postServices: PostServices,
        private router: Router
    ) {
        if(!this.authServices.isLoggedIn()){
            this.router.navigate(['/registration']);
            return;
        }
    }


    ngOnInit(): void {
        this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
        get(getPersonLinkForUserUrl(this.userId)).then(async (issf_core_id: number) => {
            if(issf_core_id) {
                this.router.navigate(['/details', PANEL_CODES.WHO, issf_core_id]);
            }
            else await this.createSSFPersonForUser();
        });
    }


    async createSSFPersonForUser(){
        const dataToSubmit = {
            basic_info: {
                contributor_id: this.userId,
                geographic_scope_type: GS_OPTIONS.NOT_SPECIFIC,
                record_type: PANEL_VALUES.WHO
            }
        }

        this.postServices
            .createRecord(PANEL_CODES.WHO, dataToSubmit)
            .subscribe(response => {
                if(response.status_code === RESPONSE_CODES.HTTP_200_OK){
                    window.location.reload();
                }
            });
    }
}
