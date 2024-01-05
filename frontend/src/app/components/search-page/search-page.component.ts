import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PANEL_CODES, PANEL_VALUES } from '../../constants/constants';
import { Contents } from '../../services/contents.service';
import { get, getSearchResults } from '../../helpers/apiCalls';
import { getAllContributorsUrl, getAllCountriesUrl } from  '../../constants/api';
import { getContributorsFullName, getYears, filterTable, sortBy } from '../../helpers/helpers';


@Component({
    selector: 'app-search-page',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.css']
})


export class SearchPageComponent implements OnInit, AfterViewInit {
    // Query params variables
    title: string;
    panels: string;
    contributors: string;
    countries: string;
    startYear: number;
    endYear: number;

    // Component normal variables
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('filterOverlay') filterOverlay: ElementRef;
    @ViewChild('filterPanel') filterPanel: ElementRef;
    @ViewChild('filterToggler') filterToggler: ElementRef;

    panelCodes: string[];
    panelValues: string[];
    years: number[];
    countryList: any;
    contributorsList: any;
    searchResults: any;
    results: string;
    selectedContributors: {label: string, value: number}[] = [];
    selectedCountries: {short_name: string, country_id: number}[] = [];
    selectedPanels: string[] = [];
    isSearchLoading: boolean = false;
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    displayedColumns: string[] = ['recordType', 'description', 'date'];


    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private contents: Contents
    ) { }


    ngOnInit(): void {
        this.panelCodes = Object.values(PANEL_CODES);
        this.panelValues = Object.values(PANEL_VALUES);
        this.years = getYears();
        this.makeGetCalls();
        this.setQueryParams();
    }


    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    @HostListener('window:resize', ['$event']) onResize() {
        // if(window.innerWidth > 900) {
        //     this.filterOverlay.nativeElement.style.display = 'none';
        //     this.filterToggler.nativeElement.style.display = 'none';
        // }
        // else {
        //     this.filterToggler.nativeElement.style.display = 'block';
        // }
    }


    adjustLineBreak(line: string){
        let formattedLine: string = '';
        const parts = line.split('<strong>');
        let index = 1;
        while(index < parts.length){
            formattedLine += '<strong>' + parts[index] + '<br />';
            index++;
        }
        return formattedLine;
    }


    async makeGetCalls() {
        get(getAllCountriesUrl).then(async (data: any) => {
            this.countryList = data;
            if(this.countries){
                this.countries.split("|").map(country_id => {
                    let short_name = "";
                    this.countryList.map(country=> {
                        if(country.country_id == country_id){
                            short_name = country.short_name
                        }
                    });
                    this.setCountries({
                        label: short_name,
                        value: parseInt(country_id)
                    })
                });
            }
        });

        get(getAllContributorsUrl).then(async (data: any) => {
            this.contributorsList = data;
            this.contributorsList.map((contributor: any)=>{
                contributor.full_name = getContributorsFullName(contributor);
                contributor.display_name = `${contributor.full_name} (${contributor.username})`
            });

            // if search filters has contributors
            if(this.contributors){
                this.contributors.split("|").map(contributor_id=>{
                    let label = "";
                    this.contributorsList.map(contributor=> {
                        if(contributor.id == contributor_id){
                            label = contributor.full_name
                        }
                    });
                    this.setContributors({
                        label: label,
                        value: parseInt(contributor_id)
                    })
                });
            }
        });
    }


    setQueryParams(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.panels = params.panels || '';
            this.contributors = params.contributors || '';
            this.countries = params.countries || '';
            this.title = params.title || '';
            this.startYear = params.startYear || '';
            this.endYear = params.endYear || '';

            this.selectedPanels = this.panels.split('|');
            if(this.selectedPanels[0].length == 0){
                this.selectedPanels = []
            }
        });

        this.search();
    }


    inSelectedPanels(panelCode: string): boolean {
        const panels = this.panels.split('|');
        if(panels.indexOf(panelCode) !== -1){
            return true;
        }
        return false;
    }


    panelClicked(code: string): void{
        let location: number;
        let removeItem = false;
        this.selectedPanels.map((panel, index) => {
            if(panel === code){
                location = index;
                removeItem = true;
            }
        });
        if(removeItem) this.selectedPanels.splice(location, 1);
        else this.selectedPanels.push(code);
    }


    getPanelCode(panelLabel: string) {
        return this.contents.getPanelCodeFromLabel(panelLabel);
    }


    getContributorIdentity(contributor: any){
        let contributor_name = contributor.first_name + ' ' + contributor.last_name;
        if(contributor_name.trim() === '') {
            return contributor.email;
        }
        return contributor_name;
    }


    search():void {
        this.isSearchLoading = true;
        getSearchResults(
                this.title,
                this.panels,
                this.contributors,
                this.countries,
                this.startYear.toString(),
                this.endYear.toString()
            )
            .then((data: any) => {
                const results = sortBy(data.results, 'edited_date', 'desc');
                this.dataSource.data = results;
                this.isSearchLoading = false;
            })
            .catch((error: any) => console.log(error))
    }


    filterTable(event: Event) {
        filterTable(event, this.dataSource);
    }


    isDuplicate(list: any[], attribute: string, value: number): boolean{
        let isDuplicate: boolean = false;
        list.map(obj=>{
            if (obj[attribute] == value){
                isDuplicate = true;
            }
        });
        return isDuplicate;
    }


    setContributors(contributor: {label: string, value: number}) {
        const isDuplicate: boolean = this.isDuplicate(this.selectedContributors, 'value', contributor.value);
        if(!isDuplicate){
            this.selectedContributors.push({
                label: contributor.label,
                value: contributor.value
            })
        }
    }


    setCountries(country: {label: string, value: number}) {
        const isDuplicate: boolean = this.isDuplicate(this.selectedCountries, 'country_id', country.value);
        if(!isDuplicate){
            this.selectedCountries.push({
                country_id: country.value,
                short_name: country.label
            })
        }
    }


    removeFromList(id: number, list:any, attribute: string){
        let loc: number;
        list.map((item,index) => {
            if(item[attribute] === id){
                loc = index;
            }
        });
        if(attribute === 'country_id') this.selectedCountries.splice(loc, 1);
        if(attribute === 'value') this.selectedContributors.splice(loc, 1);
    }


    prepareQuery(): void {
        this.contributors = "";
        this.countries = "";
        this.panels = "";

        this.selectedContributors.map(contributor => { this.contributors += contributor.value + "|" });
        this.selectedCountries.map(country => { this.countries += country.country_id + "|" });
        this.selectedPanels.map(panel => { this.panels += panel + "|" });

        // remove last | sign
        this.contributors = this.contributors.slice(0, -1);
        this.countries = this.countries.slice(0, -1);
        this.panels = this.panels.slice(0, -1);
    }


    removeFilterPanel(){
        if(window.innerWidth <= 900){
            this.filterOverlay.nativeElement.style.display = 'none';
            if(window.innerWidth <= 767){
                this.filterPanel.nativeElement.style.left = '-100%';
                this.filterPanel.nativeElement.style.right = 'auto';
            }
            else if(window.innerWidth >= 768 && window.innerWidth <= 900){
                this.filterPanel.nativeElement.style.left = 'auto';
                this.filterPanel.nativeElement.style.right = '-100%';
            }
        }
    }


    toggleFilter(){
        this.filterOverlay.nativeElement.style.display = 'block';
        if(window.innerWidth <= 767){
            this.filterPanel.nativeElement.style.left = '0';
            this.filterPanel.nativeElement.style.right = 'auto';
        }
        else if(window.innerWidth >= 768 && window.innerWidth <= 900){
            this.filterPanel.nativeElement.style.left = 'auto';
            this.filterPanel.nativeElement.style.right = '0';
        }
    }


    updateSearch(): void {
        this.prepareQuery();
        this.router.navigate(
            ['/search'],
            {
                queryParams: {
                    title: this.title,
                    panels: this.panels,
                    contributors: this.contributors,
                    countries: this.countries,
                    startYear: this.startYear,
                    endYear: this.endYear
                }
        });
        this.search();

        // for smaller screens, remove filter panel and show the result
        this.removeFilterPanel();
    }
}
