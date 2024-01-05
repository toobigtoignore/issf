import { Component, ElementRef, HostListener, Renderer2, OnInit, ViewChild } from '@angular/core';
import { get } from '../../helpers/apiCalls';
import { getColorForPanel } from '../../helpers/helpers';
import { Contents } from '../../services/contents.service';
import { getAllCountriesUrl, getAllContributionsUrl, getRecordsByCountryUrl } from '../../constants/api';
import { PANEL_CODES, PANEL_VALUES } from '../../constants/constants';
import * as L from "leaflet";
import 'leaflet.markercluster';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {
    @ViewChild('visualFullGallery') visualFullGallery: ElementRef;
    allTypes: string = 'all';
    choroplethData: any;
    countries: any;
    countryList: string[];
    filters: string[];
    filteredChoropleth: any;
    filteredData: any;
    initialFilters: string[];
    mapTypes: Object = {
        leaflet: 'Marker Map',
        choropleth: 'Choropleth Map'
    };
    mapOptions: Object[] = [
        { icon: '/assets/img/map-controller-icons/leaflet-icon.png', type: this.mapTypes['leaflet'] },
        { icon: '/assets/img/map-controller-icons/choropleth-icon.png', type: this.mapTypes['choropleth'] }
    ];
    numberOfRecordsPerType: Object;
    panelCodes: Object = PANEL_CODES;
    panelValues: Object = PANEL_VALUES;
    records: any;
    selectedCountries: string[];
    selectedMapIcon: string = this.mapOptions[0]['icon'];
    selectedMapType: string = this.mapOptions[0]['type'];
    showSideGallery: boolean = true;
    showSocialMedia: string = 'twitter';
    userId: number;
    viewTypes: Object = {
        map: 'map',
        table: 'table'
    }
    viewType: string = this.viewTypes['map'];
    visualsLoaded: boolean = false;


	  constructor(
        private contents: Contents,
        private renderer: Renderer2
    ) { }


	  async ngOnInit(): Promise<void> {
        this.initialFilters = Object.values(this.panelValues).map((recordType: string) => recordType.toLowerCase());
        this.filters = [...this.initialFilters];

        this.countries = await get(getAllCountriesUrl);
        this.choroplethData = await get(getRecordsByCountryUrl);
        this.records = await get(getAllContributionsUrl);

        this.countryList = this.countries.map((country: any) => country.short_name);
        this.filteredChoropleth = this.choroplethData;
        this.filteredData = this.records;
        this.renderMap();
        this.setRecordTypeCounts();
        this.adjustSideVisualsHeight();

        /*
            // get visualization data
            const self = this;
            d3.csv("/assets/vis/country.csv", function(data){self.choroplethData = data});
        */
	  }


    @HostListener('window:resize', ['$event']) onResize() {
        this.adjustSideVisualsHeight();
    }


    adjustClassList(action: string){
        const allFilterIcons = document.querySelectorAll('[recordType]') as any;
        for(const filterIcon of allFilterIcons){
            const recordType = filterIcon.getAttribute('recordType');
            if(recordType.toLowerCase() !== this.allTypes.toLowerCase()){
                if(action === 'add') filterIcon.classList.add('selected');
                else filterIcon.classList.remove('selected');
            }
        }
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


    adjustSideVisualsHeight(){
        const self = this;
        setTimeout(() => {
            const sideVisualsElement = document.getElementById('side-visuals');
            const windowWidth = window.innerWidth;
            if(windowWidth >= 1024 && windowWidth <= 1360){
                if(self.viewType === self.viewTypes['map']){
                    const mapSectionHeight = document.getElementById('map-section').offsetHeight;
                    sideVisualsElement.style.height = `${mapSectionHeight}px`;
                }
            }
            else {
                sideVisualsElement.style.height = '100%';
            }
        },100);
    }


    filterAllTypes(element: HTMLElement){
        if(element.classList.contains('selected')){
            this.filters = [];
            this.adjustClassList('remove');
        }
        else {
            this.filters = [...this.initialFilters];
            this.adjustClassList('add');
        }
    }


    filterMapData(){
        // FILTER LEAFLET MAP
        this.filteredData = this.records.filter((data: any) => {
            const isDataMatchedFilters = this.filters.includes(data.core_record_type.toLowerCase());
            if(this.selectedCountries?.length > 0){
                const dataInSelectedCountries = data.countries.filter((country: string) => this.selectedCountries.includes(country));
                return isDataMatchedFilters && dataInSelectedCountries.length > 0;
            }
            return isDataMatchedFilters;
        });

        // FILTER CHOROPLETH MAP
        this.filteredChoropleth = this.choroplethData.map((dataBlock: any) => {
            const dataBlockKeys = Object.keys(dataBlock);
            const formattedData = {};
            dataBlockKeys.map((key: string) => {
                if(Object.values(this.panelCodes).includes(key)){
                    const recordLabel = this.contents.getPanelLabelFromCode(key).toLowerCase();
                    if(this.filters.includes(recordLabel)){
                        formattedData[key] = dataBlock[key];
                    }
                }
                else formattedData[key] = dataBlock[key];
            });
            return formattedData;
        });
    }


    filterVisuals(event:Event){
        const element = event.target as HTMLElement;
        const recordType = element.getAttribute('recordType').toLowerCase();

        if(recordType === this.allTypes) this.filterAllTypes(element);
        else{
            if(!this.filters.includes(recordType)) this.filters.push(recordType);
            else this.filters.splice(this.filters.indexOf(recordType), 1);
        }

        element.classList.toggle('selected');

        this.filterMapData();
        this.renderMap();
    }


    onMapViewClick(){
        this.viewType = this.viewTypes['map'];
        window.dispatchEvent(new Event('resize'));
    }


    onTableViewClick(){
        this.viewType = this.viewTypes['table'];
    }


    renderMap() {
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
              maxZoom: 10,
              minZoom: 1.6
        });

        const mapCentered = L.latLng(35, 10);
        const southWest = L.latLng(-89.98155760646617, -180);
        const northEast = L.latLng(89.99346179538875, 180);
        const bounds = L.latLngBounds(southWest, northEast);

        const uniqueMapId = 'map-' + new Date().valueOf();
        const mapDivContainer = document.getElementById('leaflet-map-container');
        if(mapDivContainer.innerHTML.trim() !== ''){
            mapDivContainer.firstElementChild.remove();
        }
        const mapContainer = this.renderer.createElement('div');
        mapContainer.setAttribute('id', uniqueMapId);
        mapContainer.style.width = '100%';
        mapContainer.style.height = '100%';
        mapDivContainer.appendChild(mapContainer);

        const map = L.map(mapContainer,{
            center: mapCentered,
            zoom: 1.6,
            layers: [tiles],
            maxBounds: bounds,
            maxBoundsViscosity: 1.0
        });

        const markers = L.markerClusterGroup({
            showCoverageOnHover: false
        });

        for (const record of this.filteredData) {
            let coordinates: any;
            if(record['point']){
                const href = `/details/${this.contents.getPanelCodeFromLabel(record.core_record_type)}/${record.issf_core_id}`;
                const summary = record['core_record_summary'];
                coordinates = record['point']['coordinates'];
                const marker = L.marker(
                    new L.LatLng(coordinates[1], coordinates[0]), {
                    icon: L.icon({
                        iconUrl: this.contents.getPanelIconFromLabel(record['core_record_type'])
                    })
                });
                marker.bindPopup(
                    `<a target='_blank' href="${href}">${this.adjustLineBreak(summary)}</a>`
                );
                markers.addLayer(marker);
            }
        }

        map.addLayer(markers);
        this.visualsLoaded = true;
    }


    selectMapType(mapType: {value: string}){
        this.selectedMapType = mapType.value;
        this.selectedMapIcon = this.mapOptions.filter((option: any) => option.type === mapType.value)[0]['icon'];
        window.dispatchEvent(new Event('resize'));
    }


    setRecordTypeCounts(){
        for(const recordType of Object.values(this.panelValues)){
            this.numberOfRecordsPerType = {
                ...this.numberOfRecordsPerType,
                [recordType]: 0
            }
        };

        for(const record of this.records){
            this.numberOfRecordsPerType[record['core_record_type']] += 1;
        };

        const filterIconElements = document.querySelectorAll('[recordType]') as any;

        for(const element of filterIconElements){
            const recordType = element.getAttribute('recordType');
            const innerParagraph = this.renderer.createElement('p');
            let recordColor: string, html: string;

            if(recordType === this.allTypes) {
                recordColor = '#8db1d7';
                html = `All Records <br> <strong>${this.records.length}</strong> Records`;
            }
            else {
                recordColor = getColorForPanel(this.contents.getPanelCodeFromLabel(recordType));
                html = `
                    ${recordType} <br>
                    <strong>${this.numberOfRecordsPerType[recordType]}</strong> Records
                `;
            }

            const style = `color: ${recordColor}; position: absolute; top: 10px; right: -6px; font-size: 23px;`;
            innerParagraph.innerHTML = `<i style="${style}" class="fa fa-caret-left" aria-hidden="true"></i>` + html;
            innerParagraph.style.background = recordColor;
            element.appendChild(innerParagraph);
        }
    }


    updateFilterWithCountries(countries: string[]){
        this.selectedCountries = countries;
        this.filterMapData();
        this.renderMap();
    }
}
