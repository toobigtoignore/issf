import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { get } from '../../helpers/apiCalls';
import { getYears } from '../../helpers/helpers';
import { getAllContributorsUrl, getAllCountriesUrl } from  '../../constants/api';
import { Contents } from '../../services/contents.service';


@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.css']
})


export class SearchBarComponent implements OnInit {
    @Input() width : number = 600;
    @Input() height: number = 50;
    showDetailSearch : boolean = false;
    title : string = "";
    panels : string = "";
    contributors : string = "";
    countries : string = "";
    startYear : string = "";
    endYear : string = "";
    panelList: {code: string, label: string}[];
    years: number[];
    countriesList: any;
    contributorsList: any;
    selectedCountries: {country_id: number, name: string}[] = [];
    selectedContributors: {id: number, name: string}[] = [];
    selectedPanels: {code: string, label: string}[] = [];
    panelChosen: boolean = false;


    constructor(
        private router: Router,
        private contents: Contents
    ) {}


    async ngOnInit(): Promise<void> {
        this.years = getYears(2000);
        this.panelList = this.contents.getPanelList();

        this.countriesList = await get(getAllCountriesUrl);
        this.contributorsList = await get(getAllContributorsUrl);
        this.contributorsList.map((contributor: any)=>{
            contributor.full_name = this.getContributorsFullName(contributor)
        });
    }


    getContributorsFullName(contributor: {id: number, username:string, first_name: string, last_name: string}): string{
        let fullName = "";
        if(contributor.first_name || contributor.last_name){
            if(contributor.first_name) fullName = contributor.first_name + ' ';
            if(contributor.last_name) fullName += contributor.last_name
            return fullName;
        }
        return contributor.username;
    }


    setCountries(country: {label: string, value: number}): void {
        let countryExists = this.selectedCountries.findIndex(item => item.country_id === country.value);
        if(countryExists === -1){
            this.selectedCountries.push({
                country_id: country.value,
                name: country.label
            });
        }
    }


    setContributors(contributor: {label: string, value: number}): void {
        let contributorExists = this.selectedContributors.findIndex(item => item.id === contributor.value);
        if(contributorExists === -1){
            this.selectedContributors.push({
                id: contributor.value,
                name: contributor.label
            });
        }
    }


    setPanelInfo(panel: {label: string, value: string}): void {
        this.panelChosen = true;
        let panelExists = this.selectedPanels.findIndex(item => item.code === panel.value);
        if(panelExists === -1){
            this.selectedPanels.push({
                label: this.contents.getPanelLabelFromCode(panel.value),
                code: panel.value
            });
        }
    }


    removeFromList(id: number, list:any, attribute: string){
        let loc: number;
        list.map((item,index) => {
            if(item[attribute] === id){
                loc = index;
            }
        });

        if(attribute === 'code') this.selectedPanels.splice(loc, 1);
        if(attribute === 'country_id') this.selectedCountries.splice(loc, 1);
        if(attribute === 'id') this.selectedContributors.splice(loc, 1);
    }


    submitSearch() {
        this.selectedPanels.map(panel=>{ this.panels += panel.code + "|" });
        this.selectedCountries.map(country=>{ this.countries += country.country_id + "|" });
        this.selectedContributors.map(contributor=>{ this.contributors += contributor.id + "|" });

        this.router.navigate(
            ['/search'],
            {
                queryParams: {
                    title: this.title,
                    panels: this.panels.slice(0, -1),
                    contributors: this.contributors.slice(0, -1),
                    countries: this.countries.slice(0, -1),
                    startYear: this.startYear,
                    endYear: this.endYear
                }
            });
    }
}
