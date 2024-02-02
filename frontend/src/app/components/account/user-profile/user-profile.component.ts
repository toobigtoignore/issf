import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { get } from '../../../helpers/apiCalls';
import { createSSFPersonIfNotExist, getLoggedInUser } from '../../../helpers/helpers';
import { getPersonLinkForUserUrl } from '../../../constants/api';
import { GS_OPTIONS, STORAGE_TOKENS, PANEL_CODES, PANEL_VALUES, RESPONSE_CODES } from '../../../constants/constants';
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
        this.userId = getLoggedInUser(localStorage.getItem(STORAGE_TOKENS.ACCESS)).userId;
        createSSFPersonIfNotExist(this.userId, this.router, this.postServices, 'details');
    }
}
