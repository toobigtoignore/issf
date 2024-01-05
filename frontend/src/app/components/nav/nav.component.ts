import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../services/auth.service';


@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})


export class NavComponent implements OnInit {
    mobileMenuHidden = true;


    constructor(
        private router: Router,
        private authServices: AuthServices
    ) { }


    ngOnInit(): void {}


    hideMobileMenu() {
        this.mobileMenuHidden = true;
    }


    isLoggedIn(){
        return this.authServices.isLoggedIn();
    }


    logUserOut(){
        if(confirm('Are you sure you want to log out of your account?')) {
            this.authServices.logout();
            this.router.navigate(['/registration']);
        }
    }


    navigateToHome() {
        window.location.href = '/';
    }
}
