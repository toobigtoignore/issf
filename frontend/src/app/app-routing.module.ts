import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountComponent } from './components/account/account.component';
import { ContributeComponent } from './components/contribute/contribute.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DetailsComponent } from './components/details/details.component';
import { Error404Component } from './components/error404/error404.component';
import { ExploreComponent } from './components/explore/explore.component';
import { FAQComponent } from './components/footer/faq/faq.component';
import { PrivacyPolicyComponent } from './components/footer/privacy-policy/privacy-policy.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { UpdateComponent } from './components/update/update.component';
import { UserProfileComponent } from './components/account/user-profile/user-profile.component';


const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'contribute', component: ContributeComponent },
    { path: 'contribute/:panelID', component: ContributeComponent },
    { path: 'explore', component: ExploreComponent },
    { path: 'explore/:visID', component: ExploreComponent },
    { path: 'account', component: AccountComponent },
    { path: 'account/:tabId', component: AccountComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'details/:panel/:recordId', component: DetailsComponent },
    { path: 'update/:panel/:recordId', component: UpdateComponent },
    { path: 'search', component: SearchPageComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'registration/:action', component: RegistrationComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'faqs', component: FAQComponent },
    { path: '404', component: Error404Component },
    { path: '**', component: Error404Component }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})


export class AppRoutingModule { }
