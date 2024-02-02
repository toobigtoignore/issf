import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { get } from '../../../helpers/apiCalls';
import { createSSFPersonIfNotExist } from '../../../helpers/helpers';
import { getUsersWithoutPersonProfile } from '../../../constants/api';
import { PostServices } from '../../../services/post.service';


@Component({
    selector: 'app-contribute-who',
    templateUrl: './contribute-who.component.html',
    styleUrls: ['./contribute-who.component.css']
})


export class ContributeWhoComponent implements OnInit {
    @Input() formSeq: number;
    users: any;
    selectedPersonId: number;


    constructor(
        private postServices: PostServices,
        private router: Router
    ) { }


    async ngOnInit(): Promise<void> {
        this.users = await get(getUsersWithoutPersonProfile);
    }


    createWhoRecord(){
        createSSFPersonIfNotExist(this.selectedPersonId, this.router, this.postServices, 'update');
    }


    filterUsers(event: Event){
        const element = event.target as HTMLFormElement;
        const options = Array.from(element.closest('.form-input').querySelectorAll('.select-option'));
        options.filter(option => {
            const optionText = option.textContent.toLowerCase();
            const value = element.value.toLowerCase();

            if(optionText.startsWith(value)) (option as HTMLElement).style.display = 'block';
            else (option as HTMLElement).style.display = 'none';
        });
    }


    getUserName(user: any){
        const firstName = user.first_name? user.first_name + ' ' : '';
        const initials = user.initials? user.initials + ' ' : '';
        const lastName = user.last_name? user.last_name : '';
        const fullName = (firstName + initials + lastName).trim();
        if(!fullName || fullName === ''){
            return user.email;
        }
        return fullName;
    }


    onUserSelect(event: Event){
        const element = event.target as HTMLElement;
        document.querySelectorAll('.select-option').forEach( option => option.classList.remove('selected'));
        element.classList.add('selected');
        const value = element.getAttribute('value');
        this.selectedPersonId = parseInt(value);
    }
}
