import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// ANGULAR MATERIAL
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar';

// COMMON
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// DIRECTIVES
import { ClickOutsideDirective } from './directives/clickOutside.directive';

// PLATFORM BROWSER
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

// SERVICES
import { AuthServices } from './services/auth.service';
import { CommonServices } from './services/common.service';
import { Contents } from './services/contents.service';
import { FormatterServices } from './services/formatter.service';
import { PostServices } from './services/post.service';

// VISUALIZATIONS
import { CountryComponent } from './components/visualizations/country/country.component';
import { GovmodComponent } from './components/visualizations/govmod/govmod.component';
import { GearVesselComponent } from './components/visualizations/gear-vessel/gear-vessel.component';
import { BluejusticeComponent } from './components/visualizations/bluejustice/bluejustice.component';
import { SotaComponent } from './components/visualizations/sota/sota.component';
import { MshareComponent } from './components/visualizations/mshare/mshare.component';
import { WiwComponent } from './components/visualizations/wiw/wiw.component';
import { ResearchComponent } from './components/visualizations/research/research.component';

// COMPONENTS
import { AccountComponent } from './components/account/account.component';
import { AppComponent } from './app.component';
import { AuthenticationFormComponent } from './components/registration/authentication-form/authentication-form.component';
import { BluejusticeDetailsComponent } from './components/details/bluejustice-details/bluejustice-details.component';
import { CasestudyDetailsComponent } from './components/details/casestudy-details/casestudy-details.component';
import { ComboBoxComponent } from './components/combo-box/combo-box.component';
import { ContributeBluejusticeComponent } from './components/contribute/contribute-bluejustice/contribute-bluejustice.component';
import { ContributeCaseComponent } from './components/contribute/contribute-case/contribute-case.component';
import { ContributeComponent } from './components/contribute/contribute.component';
import { ContributeGovernanceComponent } from './components/contribute/contribute-governance/contribute-governance.component';
import { ContributeGuidelinesComponent } from './components/contribute/contribute-guidelines/contribute-guidelines.component';
import { ContributeOrganizationComponent } from './components/contribute/contribute-organization/contribute-organization.component';
import { ContributeProfileComponent } from './components/contribute/contribute-profile/contribute-profile.component';
import { ContributedRecords } from './components/account/contributed-records/contributed-records.component';
import { ContributeSotaComponent } from './components/contribute/contribute-sota/contribute-sota.component';
import { ContributeWhoComponent } from './components/contribute/contribute-who/contribute-who.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DetailsComponent } from './components/details/details.component';
import { Error404Component } from './components/error404/error404.component';
import { ExploreComponent } from './components/explore/explore.component';
import { FAQComponent } from './components/footer/faq/faq.component';
import { FooterComponent } from './components/footer/footer.component';
import { GeoscopeComponent } from './components/contribute/geoscope/geoscope.component';
import { GovernanceDetailsComponent } from './components/details/governance-details/governance-details.component';
import { GuidelinesDetailsComponent } from './components/details/guidelines-details/guidelines-details.component';
import { InitialProfileComponent } from './components/dashboard/initial-profile/initial-profile.component';
import { NavComponent } from './components/nav/nav.component';
import { OrganizationDetailsComponent } from './components/details/organization-details/organization-details.component';
import { PanelBasedComponentComponent } from './components/details/panel-based-component/panel-based-component.component';
import { PasswordSetting } from './components/account/password-setting/password-setting.component';
import { PrivacyPolicyComponent } from './components/footer/privacy-policy/privacy-policy.component';
import { ProfileCharacteristicsComponent } from './components/update/update-profile/profile-characteristics/profile-characteristics.component';
import { ProfileDetailsComponent } from './components/details/profile-details/profile-details.component';
import { RecentContributionComponent } from './components/dashboard/recent-contribution/recent-contribution.component';
import { RecordTableComponent } from './components/dashboard/record-table/record-table.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { SelectBoxComponent } from './components/select-box/select-box.component';
import { SotaDetailsComponent } from './components/details/sota-details/sota-details.component';
import { UpdateComponent } from './components/update/update.component';
import { UpdateBluejusticeComponent } from './components/update/update-bluejustice/update-bluejustice.component';
import { UpdateCasestudiesComponent } from './components/update/update-casestudies/update-casestudies.component';
import { UpdateGuidelinesComponent } from './components/update/update-guidelines/update-guidelines.component';
import { UpdateProfileComponent } from './components/update/update-profile/update-profile.component';
import { UpdateOrganizationComponent } from './components/update/update-organization/update-organization.component';
import { UpdateWhoComponent } from './components/update/update-who/update-who.component';
import { UpdateSotaComponent } from './components/update/update-sota/update-sota.component';
import { UserAccountComponent } from './components/account/user-account/user-account.component';
import { VisualGalleryComponent } from './components/dashboard/visual-gallery/visual-gallery.component';
import { VisualSideGalleryComponent } from './components/dashboard/visual-side-gallery/visual-side-gallery.component';
import { WelcomeComponent } from './components/dashboard/welcome/welcome.component';
import { WhoDetailsComponent } from './components/details/who-details/who-details.component';
import { ThemeComponent } from './components/update/theme/theme.component';
import { CharacteristicsComponent } from './components/update/characteristics/characteristics.component';
import { SpeciesLinkComponent } from './components/update/species-link/species-link.component';
import { CheckboxSelect } from './components/checkbox-select/checkbox-select.component';


@NgModule({
    declarations: [
        AccountComponent,
        AppComponent,
        AuthenticationFormComponent,
        BluejusticeComponent,
        BluejusticeDetailsComponent,
        CasestudyDetailsComponent,
        CheckboxSelect,
        ClickOutsideDirective,
        ComboBoxComponent,
        ContributeComponent,
        ContributeBluejusticeComponent,
        ContributeCaseComponent,
        ContributeGovernanceComponent,
        ContributeGuidelinesComponent,
        ContributeOrganizationComponent,
        ContributeProfileComponent,
        ContributeSotaComponent,
        ContributeWhoComponent,
        ContributedRecords,
        CountryComponent,
        DashboardComponent,
        DetailsComponent,
        Error404Component,
        ExploreComponent,
        FAQComponent,
        FooterComponent,
        GearVesselComponent,
        GeoscopeComponent,
        GovernanceDetailsComponent,
        GovmodComponent,
        GuidelinesDetailsComponent,
        InitialProfileComponent,
        MshareComponent,
        NavComponent,
        OrganizationDetailsComponent,
        PanelBasedComponentComponent,
        PasswordSetting,
        PrivacyPolicyComponent,
        ProfileDetailsComponent,
        RecentContributionComponent,
        RecordTableComponent,
        RegistrationComponent,
        ResearchComponent,
        SearchBarComponent,
        SearchPageComponent,
        SelectBoxComponent,
        SotaComponent,
        SotaDetailsComponent,
        UpdateComponent,
        UpdateBluejusticeComponent,
        UpdateCasestudiesComponent,
        UpdateGuidelinesComponent,
        UpdateSotaComponent,
        UpdateProfileComponent,
        UpdateOrganizationComponent,
        UpdateWhoComponent,
        UserAccountComponent,
        VisualGalleryComponent,
        VisualSideGalleryComponent,
        WelcomeComponent,
        WhoDetailsComponent,
        WiwComponent,
        ThemeComponent,
        CharacteristicsComponent,
        ProfileCharacteristicsComponent,
        SpeciesLinkComponent
    ],


    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        LeafletModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatToolbarModule,
        ReactiveFormsModule
    ],


    exports: [
        CommonModule
    ],


    providers: [Contents, AuthServices, CommonServices, FormatterServices, PostServices],
    bootstrap: [AppComponent]
})


export class AppModule { }
