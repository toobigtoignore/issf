import { JwtHelperService } from '@auth0/angular-jwt';
import { MatTableDataSource } from "@angular/material/table";
import {
    getPersonRecordUrl,
    getSotaRecordUrl,
    getProfileRecordUrl,
    getOrganizationRecordUrl,
    getCasestudyRecordUrl,
    getGovernanceRecordUrl,
    getBluejusticeRecordUrl,
    getGuidelinesRecordUrl
} from '../constants/api';
import { COUNTRIES_LIST, DETAILS_ACCORDIONS_LABELS, GS_LABELS, GS_OPTIONS, PANEL_CODES, PANELS_LIST } from '../constants/constants';


export const capitalize = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


export const filterTable = (event: Event, dataSource: MatTableDataSource<any>)  => {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
}


export const getColorForPanel = (panel: string) => {
    switch(panel) {
        case PANEL_CODES.WHO: return '#ee364d';
        case PANEL_CODES.SOTA: return '#2bbb5f';
        case PANEL_CODES.PROFILE: return '#ffd132';
        case PANEL_CODES.ORGANIZATION: return '#ed5fa9';
        case PANEL_CODES.CASESTUDY: return '#bcd745';
        case PANEL_CODES.GOVERNANCE: return '#ca9174';
        case PANEL_CODES.BLUEJUSTICE: return '#4d9de0';
        case PANEL_CODES.GUIDELINES: return '#1c1c77';
    }
}


export const getContributorsFullName = (contributor: {id: number, username:string, first_name: string, last_name: string}): string => {
    let fullName = "";
    if(contributor.first_name || contributor.last_name){
        if(contributor.first_name) fullName = contributor.first_name + ' ';
        if(contributor.last_name) fullName += contributor.last_name
        return fullName;
    }
    return contributor.username;
}


export const getCountryCodesFromNames = (countries: string[], countryList: any) => {
    const countryCodes = [];
    for(const country of countries){
        countryCodes.push(countryList.find(c => c.short_name === country).country_id);
    }
    return countryCodes;
}


export const getCountryNameFromCode = (country_id: number) => {
    for(const country of COUNTRIES_LIST){
        if(country.id === country_id) {
            return country.name;
        }
    }
}


export const getGeoScopeLabel = (geoScopeType: string) => {
    switch(geoScopeType) {
        case GS_OPTIONS.LOCAL: return GS_LABELS.GS_LOCAL;
        case GS_OPTIONS.SUB_NATIONAL: return GS_LABELS.GS_SUBNATION;
        case GS_OPTIONS.NATIONAL: return GS_LABELS.GS_NATIONAL;
        case GS_OPTIONS.REGIONAL: return GS_LABELS.GS_REGION;
        case GS_OPTIONS.GLOBAL: return GS_LABELS.GS_NS_GLOBAL;
        case GS_OPTIONS.NOT_SPECIFIC: return GS_LABELS.GS_NS_GLOBAL;
    }
}


export const getPanelIconFromCode = (panelCode: string) => {
    return PANELS_LIST.find(panelRow => panelRow.code === panelCode).icon;
}


export const getPanelLabelFromCode = (panelCode:string) => {
    return PANELS_LIST.find(panelRow => panelRow.code === panelCode).label;
}


export const getPanelSections = (panel: string) => {
    switch(panel) {
        case PANEL_CODES.WHO: return [...DETAILS_ACCORDIONS_LABELS.WHO];
        case PANEL_CODES.SOTA: return [...DETAILS_ACCORDIONS_LABELS.SOTA];
        case PANEL_CODES.PROFILE: return [...DETAILS_ACCORDIONS_LABELS.PROFILE];
        case PANEL_CODES.ORGANIZATION: return [...DETAILS_ACCORDIONS_LABELS.ORGANIZATION];
        case PANEL_CODES.CASESTUDY: return [...DETAILS_ACCORDIONS_LABELS.CASESTUDY];
        case PANEL_CODES.GOVERNANCE: return [...DETAILS_ACCORDIONS_LABELS.GOVERNANCE];
        case PANEL_CODES.BLUEJUSTICE: return [...DETAILS_ACCORDIONS_LABELS.BLUEJUSTICE];
        case PANEL_CODES.GUIDELINES: return [...DETAILS_ACCORDIONS_LABELS.GUIDELINES];
    }
}


export const getRecordDetailsUrl = (panel: string, id: number) => {
    switch(panel){
        case PANEL_CODES.WHO: return getPersonRecordUrl(id);
        case PANEL_CODES.SOTA: return getSotaRecordUrl(id);
        case PANEL_CODES.PROFILE: return getProfileRecordUrl(id);
        case PANEL_CODES.ORGANIZATION: return getOrganizationRecordUrl(id);
        case PANEL_CODES.CASESTUDY: return getCasestudyRecordUrl(id);
        case PANEL_CODES.GOVERNANCE: return getGovernanceRecordUrl(id);
        case PANEL_CODES.BLUEJUSTICE: return getBluejusticeRecordUrl(id);
        case PANEL_CODES.GUIDELINES: return getGuidelinesRecordUrl(id);
    }
}


export const getRecordName = (data: any, panel: string) => {
    switch(panel) {
        case PANEL_CODES.WHO: {
            const initials = data.core?.user?.initials || '';
            const fullname = data.core?.user?.first_name + ' ' +  initials + ' ' + data.core?.user?.last_name;
            const email = data.core?.user?.email;
            const trimmedFullName = fullname.trim();
            return trimmedFullName === '' ? email : trimmedFullName + ' | ' + email;
        }
        case PANEL_CODES.SOTA: {
            let publicationType = data.other_publication_type || data.publication?.publication_type;
            return publicationType + " | " + (data.author_names || data.year);
        };
        case PANEL_CODES.PROFILE: {
            let recordName = data.ssf_name + " | " + data.start_year;
            recordName += data.end_year ? ' - ' + data.end_year : '';
            return recordName;
        }
        case PANEL_CODES.ORGANIZATION: return data.organization_name + " | " + data.organization_country?.short_name;
        case PANEL_CODES.CASESTUDY: return data.name + " | " + data.role;
        case PANEL_CODES.GOVERNANCE: return data.casestudy_country;
        case PANEL_CODES.BLUEJUSTICE: return data.ssf_name + " | " + data.ssf_country?.short_name;
        case PANEL_CODES.GUIDELINES: return data.title + " | " + data.location;
    }
}


export const getOtherValue = (valueArr: string[], lookUpArr: string[]): string|null  => {
    let otherValue: string|null;
    lookUpArr = Object.values(lookUpArr);
    for(const val of valueArr){
        if(lookUpArr.indexOf(val) === -1) {
            otherValue = val;
            break;
        }
    }
    return otherValue;
}


export const getUserId = (token: string): number => {
    if(!token) return null;
    const tokenHelper = new JwtHelperService();
    const decodedToken = tokenHelper.decodeToken(token);
    return decodedToken.user_id;
}


export const getYears = (startYear:number = 2010)=> {
    const currentYear = new Date().getFullYear();
    const years = [];
    for(let year=currentYear; year>=startYear; year--){
        years.push(year);
    }
    return years;
}


export const objectsToArray = (objs:Object[], key: string): any[]  => {
    return objs.map((obj: any) => obj[key]);
}


export const parseDateElements = (date: string, delimiter: string)=> {
    const dateSplit = date.split(delimiter);
    return {
        year: parseInt(dateSplit[0]),
        month: parseInt(dateSplit[1]),
        day: parseInt(dateSplit[2])
    }
}


export const sortBy = (data: Object[], key: string, order: string): Object[] => {
    return (
        data.sort(function(item1, item2) {
            const key1 = new Date(item1[key]);
            const key2 = new Date(item2[key]);
            if(order === 'desc'){
                if (key1 > key2) return -1;
                if (key1 < key2) return 1;
            }
            if(order === 'asc'){
                if (key1 < key2) return -1;
                if (key1 > key2) return 1;
            }
            return 0;
        })
    );
}


export const toggleOnSpecificValue = (event: Event, targetValue: string, isOtherValueRequired: boolean = false) => {
    const element = event.target as HTMLFormElement;
    const targetElement = element.closest('[togglerContainer]').querySelector('[toggleDisable]') as HTMLElement;
    if(element.value === targetValue){
        targetElement.style.display = 'block';
        targetElement.querySelectorAll('[toggleOnChange]').forEach(element => {
            element.removeAttribute('disabled');
            if(isOtherValueRequired) element.setAttribute('required', 'required');
        });
        return;
    }
    targetElement.style.display = 'none';
    targetElement.querySelectorAll('[toggleOnChange]').forEach(element => {
        element.setAttribute('disabled', 'disabled');
        if(isOtherValueRequired) element.removeAttribute('required');
    });
}


export const toggleSection = (event: Event) => {
    const element = event.target as HTMLFormElement;
    const elementToToggle = element.parentElement.nextElementSibling as HTMLElement;
    if(elementToToggle.style.display !== 'none') {
        elementToToggle.style.display = 'none';
        elementToToggle.setAttribute('disabled', 'disabled');
        elementToToggle.removeAttribute('required');
    }
    else {
        elementToToggle.style.display = 'block';
        elementToToggle.removeAttribute('disabled');
        elementToToggle.setAttribute('required','required');
    }
}
