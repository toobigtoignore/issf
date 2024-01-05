import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GS_LOCAL_AREA_SETTINGS, GS_OPTIONS, GS_REGIONS, GS_SUBNATION_AREA_TYPES } from '../../../constants/constants.js';
import { CommonServices } from '../../../services/common.service';
import { countryList, localScopeType, nationalScopeType, regionalScopeType, subnationScopeType } from '../../../../assets/js/types';
import { toggleOnSpecificValue } from '../../../helpers/helpers';
import initializedForms from './geoscopesInitializer';
import * as L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.js";


@Component({
    selector: 'app-geoscope',
    templateUrl: './geoscope.component.html',
    styleUrls: ['./geoscope.component.css']
})


export class GeoscopeComponent implements AfterViewInit, OnInit {
    @Input() countryList: countryList[];
    @Input() geoScopeInfo: any;
    @ViewChild('scopeDetails') scopeDetails: ElementRef;
    @ViewChild('localFormRef') localFormRef: ElementRef;
    @ViewChild('subnationalFormRef') subnationalFormRef: ElementRef;
    @ViewChild('nationalFormRef') nationalFormRef: ElementRef;
    @ViewChild('regionalFormRef') regionalFormRef: ElementRef;

    localForms: localScopeType;
    subnationalForms: subnationScopeType;
    nationalForm: nationalScopeType;
    regionalForms: regionalScopeType;

    localFormContainer: HTMLElement;
    subnationFormContainer: HTMLElement;
    regionalFormContainer: HTMLElement;

    localFormHTML: string;
    subnationFormHTML: string;
    regionalFormHTML: string;

    localSubOtherValue: string;
    regionalOtherValue: string;

    localAreaSettings: GS_LOCAL_AREA_SETTINGS;
    subNationAreaTypes: GS_SUBNATION_AREA_TYPES;
    regions: GS_REGIONS;

    selectedScope: string;
    scopeLabels: GS_OPTIONS;
    uniqueMapId: string;


    constructor(private commonServices: CommonServices) { }


    ngOnInit(): void {
        this.localForms = initializedForms.localForms;
        this.subnationalForms = initializedForms.subnationalForms;
        this.nationalForm = initializedForms.nationalForm;
        this.regionalForms = initializedForms.regionalForms;

        this.localSubOtherValue = 'Other';
        this.regionalOtherValue = '9';

        this.localAreaSettings = GS_LOCAL_AREA_SETTINGS;
        this.subNationAreaTypes = GS_SUBNATION_AREA_TYPES;
        this.regions = GS_REGIONS;

        this.selectedScope = GS_OPTIONS.LOCAL;
        this.scopeLabels = GS_OPTIONS;

        if(this.geoScopeInfo) {
            if(this.geoScopeInfo.type){
                this.selectedScope = this.geoScopeInfo.type;
                if(this.selectedScope === GS_OPTIONS.LOCAL) this.localForms = this.geoScopeInfo;
                if(this.selectedScope === GS_OPTIONS.SUB_NATIONAL) this.subnationalForms = this.geoScopeInfo;
                if(this.selectedScope === GS_OPTIONS.NATIONAL) this.nationalForm = this.geoScopeInfo;
                if(this.selectedScope === GS_OPTIONS.REGIONAL) this.regionalForms = this.geoScopeInfo;
            }
        }
        this.commonServices.scopeEmitter.emit(this.selectedScope);
    }


    ngAfterViewInit(): void {
        /* grab the form containers */
        this.localFormContainer = this.localFormRef.nativeElement;
        this.subnationFormContainer = this.subnationalFormRef.nativeElement;
        this.regionalFormContainer = this.regionalFormRef.nativeElement;

        this.localFormHTML = this.localFormContainer.firstElementChild.outerHTML;
        this.subnationFormHTML = this.subnationFormContainer.firstElementChild.outerHTML;
        this.regionalFormHTML = this.regionalFormContainer.firstElementChild.outerHTML;

        /* delete the remove button from the first form as the first form is mandatory and must be filled */
        this.localFormContainer.firstElementChild.querySelector('[removeform]').remove();
        this.subnationFormContainer.firstElementChild.querySelector('[removeform]').remove();
        this.regionalFormContainer.firstElementChild.querySelector('[removeform]').remove();

        /* render the map */
        this.renderMap(this.localFormContainer, GS_OPTIONS.LOCAL);
        this.renderMap(this.subnationFormContainer, GS_OPTIONS.SUB_NATIONAL);
    }


    addAnotherForm(formType: string) {
        switch(formType){
            case this.scopeLabels.LOCAL: {
                this.duplicateForm(formType, this.localFormContainer, this.localFormHTML, this.localSubOtherValue);
                break;
            }
            case this.scopeLabels.SUB_NATIONAL: {
                this.duplicateForm(formType, this.subnationFormContainer, this.subnationFormHTML, this.localSubOtherValue);
                break;
            }
            case this.scopeLabels.REGIONAL: {
                this.duplicateForm(formType, this.regionalFormContainer, this.regionalFormHTML, this.regionalOtherValue);
                break;
            }
            default: break;
        }
    }


    /* bind the country selection and filterer functions on the appended elements */
    bindRegionalFunctions(appendedChild:HTMLElement) {
        appendedChild
            .querySelectorAll('[countryoption]')
            .forEach((element)=>{
                element.addEventListener('click',
                    (event) => this.onRegionalCountryClick(event)
                )
            });

        // bind country filterer
        appendedChild
            .querySelector('[regionalCountryFilterer]')
            .addEventListener('keyup', (event) => this.filterCountries(event))
    }


    /* bind the toggle field when other value is chosen and remove form button is pressed */
    bindToggleAndRemove(appendedChild:HTMLElement, value: string) {
        // bind toggle on other value function
        appendedChild
            .querySelector('[selectionToggler]')
            .addEventListener('change',
                (event) => this.toggleOnOther(event, value)
            );

        // bind form removal function
        appendedChild
            .querySelector('[removeform]')
            .addEventListener('click', this.onRemoveGeomapPress);
    }


    counter(num: number) {
        return new Array(num);
    }


    duplicateForm(formType: string, container: HTMLElement, formHtml: string, otherValue: string) {
        /* Insert form at the end of the container */
        container.lastElementChild.insertAdjacentHTML("afterend", formHtml);
        const appendedForm = container.lastElementChild as HTMLElement;

        /* re-bind the functions to the cloned elements */
        this.bindToggleAndRemove(appendedForm, otherValue);

        if(formType === this.scopeLabels.LOCAL || formType === this.scopeLabels.SUB_NATIONAL) this.renderMap(container, formType, true);
        else if(formType === this.scopeLabels.REGIONAL) this.bindRegionalFunctions(appendedForm);
    }


    filterCountries(event: Event){
        const element = event.target as HTMLFormElement;
        const countriesList = element.nextElementSibling;
        const countryElements = Array.from(countriesList.querySelectorAll('[countryoption]'));

        countryElements.filter(option => {
            const optionText = option.textContent.toLowerCase();
            const value = element.value.toLowerCase();

            if(optionText.startsWith(value)) (option as HTMLElement).style.display = 'block';
            else (option as HTMLElement).style.display = 'none';
        });
    }


    getLatLong(coordinates: number[]) {
        // const coordinates = JSON.parse(latLongStr).coordinates;
        const long = coordinates[0];
        const lat = coordinates[1];
        return { long, lat }
    }


    /* generates unique id for each map to remove duplication */
    generateMapid(){
        this.uniqueMapId = 'map-' + new Date().valueOf();
        return this.uniqueMapId;
    }


    isCountryInRegion(regionalCountries:string[], country: string){
        return regionalCountries.includes(country);
    }


    isRegionOtherType(regions:{id: number, name: string}[], regionName: string){
        const arr = regions.map(r => r.name);
        const result = this.isOtherType(arr, regionName);
        return result;
    }


    isOtherType(arr:string[], value: string){
        if(arr.indexOf(value) === -1 && value !== '') {
            return true;
        }
        return false;
    }


    /* triggers when a country from the regional selected box is clicked */
    onRegionalCountryClick(event: Event){
        let content = '', value = '';
        const element = event.target as HTMLElement;
        const parentEl = element.parentNode;
        const ancestEl = parentEl.parentNode.parentNode as HTMLElement;

        element.classList.toggle('selected');
        const siblings = parentEl.querySelectorAll('.selected');
        for(let sibling of Object.values(siblings)){
            content += '<li>' + sibling.textContent + '</li>';
            value += sibling.getAttribute('countryoption') + ',';
        }
        ancestEl.querySelector('[selectedcountries]').innerHTML = content;
        (ancestEl.lastElementChild as HTMLFormElement).value = value.slice(0, -1);
    }


    /* remove the form if remove button is pressed */
    onRemoveGeomapPress(event: Event){
        if(confirm('Are you sure you want to remove this section?')) {
            (event.target as HTMLElement).closest('[geogroup]').remove();
        }
    }


    onScopeSelect(selectedScope: string) {
        this.selectedScope = selectedScope;
        this.commonServices.scopeEmitter.emit(selectedScope);

        /*
            trigger resize function to move the map to the appropriate location
            needed only for local and sub-national geo scope as only these two have the map
        */
        window.dispatchEvent(new Event('resize'));
    }


    pointsToValue(points: number[]){
        if(points.length === 0 || !points) {
            return '';
        }
        const { long, lat } = this.getLatLong(points);
        return long + "," + lat;
    }


    /* render the map */
    renderMap(element: HTMLElement, formType: string, duplicateMap: boolean = false) {
        let marker: any;
        const forms = duplicateMap
                        ? [element.lastElementChild]
                        : Array.from(element.getElementsByTagName('form'));

        for(let i=0; i<forms.length; i++){
            const form = forms[i];
            const lastFormSection = form.lastElementChild;
            const mapContainer = lastFormSection.lastElementChild;
            mapContainer.setAttribute('id', this.generateMapid());
            const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
            const customMarker= L.Icon.extend({
                options: {
                    shadowUrl: null,
                    iconAnchor: new L.Point(12, 12),
                    iconSize: new L.Point(25, 40),
                    iconUrl: iconUrl
                }
            });
            const attribution = "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>";
            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const tiles = new L.TileLayer(tileUrl, {
                  attribution,
                  noWrap: true,
                  maxZoom: 8,
                  minZoom: 1.5
            });
            const mapCentered = new L.LatLng(45, 5);
            const southWest = L.latLng(-89.98155760646617, -180);
            const northEast = L.latLng(89.99346179538875, 180);
            const bounds = L.latLngBounds(southWest, northEast);
            const map = new L.Map(this.uniqueMapId,{
                center: mapCentered,
                zoom: 1.5,
                layers: [tiles],
                maxBounds: bounds,
                maxBoundsViscosity: 1.0
            });

            if(this.geoScopeInfo?.mapPoints && this.geoScopeInfo?.type === formType && !duplicateMap){
                const { lat, long } = this.getLatLong(this.geoScopeInfo.mapPoints[i]);
                const mapMarker = new L.LatLng(lat, long);
                marker = L.marker(mapMarker, {
                    icon: L.icon({
                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
                    })
                });
                map.addLayer(marker);
            }

            // TOOLBAR
            const drawnItems = new L.FeatureGroup().addTo(map);
            const drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,
                    polygon: false,
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: {
                        icon: new customMarker()
                    }
                },
                edit: {
                    featureGroup: drawnItems,
                    edit: false
                }
            });
            map.addControl(drawControl);

            const latLngInputEl = mapContainer.previousElementSibling as HTMLFormElement;
            map.on('draw:created', function (e) {
                // to remove first marker set in update mode
                map.eachLayer(function (layer: any) {
                    if(layer.options.icon && marker){
                        map.removeLayer(layer);
                        marker = null;
                    }
                });

                const latLng = e.layer.getLatLng();
                drawnItems.eachLayer(layer => map.removeLayer(layer));
                drawnItems.addLayer(e.layer);
                latLngInputEl.value = latLng.lat + "," + latLng.lng;
            });

            map.on('draw:deleted', function (e) {
                latLngInputEl.value = "";
            });
        }
    }


    /*
        it is possible that there were some elements with hidden attribute
        that was set to visible again by the user while interacting with the form.
        The new cloned element should make them hidden again initially
        to get back to the initial stage before appending to the DOM
    */
    resetHiddenAttributeInClonedElements(clonedElement){
        clonedElement = clonedElement as HTMLElement;
        const hiddenItems = clonedElement.querySelectorAll('[hidden]');
        for (let item of Object.values(hiddenItems)){
            (item as HTMLElement).style.display = 'none';
        }
    }


    /* based on values provided in a field, we may need to toggle another field */
    toggleOnOther(event: Event, targetValue: string){
        toggleOnSpecificValue(event, targetValue);
    }
}
