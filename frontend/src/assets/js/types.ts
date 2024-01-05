import { ElementRef, Renderer2 } from "@angular/core";


export interface countryList {
    country_id: number,
    short_name: string
};


export interface getGeoScopeDetailsInfo {
    data: any,
    panel: string,
    activeBlock: number,
    mapSection: ElementRef,
    renderer: Renderer2,
    type?: string,
    values?: string[]
};


export interface globalAndNotSpecificType {
    type: string,
    numberOfScope: number
};


export interface languages {
    language_id: number,
    language_name: string
};


export interface localScopeType {
    type: string,
    areaNames: string[],
    alternateNames: string[],
    countryCodes: number[],
    areaSettings: string[],
    mapPoints: string[],
    numberOfScope: number
};


export interface loginAccessToken {
    user_id: number;
    exp: number;
    jti: number;
}


export interface nationalScopeType {
    type: string,
    country: string
};


export interface regionalScopeType {
    type: string,
    regions: string[],
    countries: string[],
    numberOfScope: number
};


export interface subnationScopeType {
    type: string,
    subnationNames: string[],
    subnationCountries: number[],
    subnationTypes: string[],
    mapPoints: string[],
    numberOfScope: number
};


export interface whoList {
    name: string,
    contributor_id: number
};
