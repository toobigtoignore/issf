import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthServices } from '../../services/auth.service';
import { JWT_TOKENS } from '../../constants/constants';
import { get } from '../../helpers/apiCalls';
import { getUserId } from '../../helpers/helpers';
import { getContributionsByUserIdUrl } from '../../constants/api';


@Component({
	selector: 'app-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.css']
})


export class AccountComponent implements OnInit {
    activeTrigger: number = 1;
    userId: number;
    usersContributions: any;
    triggers = [
        { sn: 1, id:'user-info', title: 'Account Information' },
        { sn: 2, id:'change-password', title: 'Password Setting' },
        { sn: 3, id:'contributed-records', title: 'My Contributions' }
    ];


    constructor(
        private activeRoute: ActivatedRoute,
        private authServices: AuthServices,
        private router: Router
    ) {
        async ()=>{
            if(!this.authServices.isLoggedIn()){
                this.router.navigate(['/registration']);
                return;
            }
        }
    }


    async ngOnInit(): Promise<void> {
        this.activeRoute.paramMap.subscribe(params => {
            const tabId = params.get("tabId");
            this.triggers.map((trigger: {sn: number, id: string, title: string}) =>{
                if(trigger.id === tabId){
                    this.activeTrigger = trigger.sn;
                }
            })
        });

        this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
        this.usersContributions = await get(getContributionsByUserIdUrl(this.userId));
    }


    updateTrigger(sn: number){
        this.activeTrigger = sn;
    }
}
