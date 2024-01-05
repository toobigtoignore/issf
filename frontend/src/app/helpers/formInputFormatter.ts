import { ElementRef } from '@angular/core';
import { 
    DETAILS_ACCORDIONS_LABELS, 
    INITIAL_CONTRIBUTION, 
    PANEL_CODES,
    KEEP_BLUEJUSTICE_IMAGE_KEY,
    REMOVE_BLUEJUSTICE_IMAGE_KEY
} from '../constants/constants';




/**************************** HELPERS *******************************/
export const checkRequiredFields = (form: ElementRef): boolean => {
    let formIsValid: boolean = true;
    const requiredFields = form.nativeElement.querySelectorAll('[required]');
    for (let i=0; i<requiredFields.length; i++){
        let inputField = requiredFields[i] as HTMLFormElement;
        if(inputField.value.trim() === "" && !inputField.hasAttribute('disabled')){
            inputField.classList.add('not-satisfied');
            inputField.setAttribute('placeholder', 'This field is required...');
            formIsValid = false;
        } 
        else {
            inputField.classList.remove('not-satisfied');
        }
    }
    return formIsValid;
}


const isNullable = (key: string, panel: string): boolean => {
    let nullableNames: string[];
    switch(panel){
        case PANEL_CODES.WHO: {
            nullableNames = [
                'number_publications'
            ]; 
            break;
        }
        case PANEL_CODES.SOTA: {
            nullableNames = [
                'nonenglish_language_id', 
                'demographics_other_text', 
                'demographic_details', 
                'employment_details', 
                'ssf_defined'
            ]; 
            break;
        }
        case PANEL_CODES.PROFILE: nullableNames = []; break;
        case PANEL_CODES.ORGANIZATION: nullableNames = []; break;
        case PANEL_CODES.CASESTUDY: nullableNames = []; break;
        case PANEL_CODES.GUIDELINES: {
            nullableNames = [
                'end_day', 
                'end_month', 
                'end_year',
                'link'
            ]; 
            break;
        }
    }
    if(nullableNames.indexOf(key) !== -1) return true;
    return false;
}









/**************************** MAIN FORMATTER *******************************/
export const formatFormValues = (formInfo: {
    panel: string,
    formType: string,
    formElement: ElementRef
}) => {
    const { panel, formType, formElement } = formInfo;
    const elementsInForm = formElement.nativeElement.elements;
    switch(panel){
        case PANEL_CODES.WHO: return whoFormsFormatter(formType, elementsInForm);
        case PANEL_CODES.SOTA: return sotaFormsFormatter(formType, elementsInForm);
        case PANEL_CODES.PROFILE: return profileFormsFormatter(formType, formElement);
        case PANEL_CODES.ORGANIZATION: return organizationFormsFormatter(formType, formElement);
        case PANEL_CODES.CASESTUDY: return caseStudiesFormsFormatter(formType, formElement);
        case PANEL_CODES.BLUEJUSTICE: return bluejusticesFormsFormatter(formType, formElement);
        case PANEL_CODES.GUIDELINES: return guidelinesFormsFormatter(formType, formElement);
    }
}









/************************** COMMON FORMATTERS ******************************/
export const formatExternalLinks = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: { updated_links: Object[] } = { updated_links: [] };
    const linkArray:Object[] = [];
    const form = inputElementsList[0].form;
    const linkSets = form.querySelector('tbody').childNodes;

    for(const set of linkSets){
        if(set.nodeName === 'TR' || set.nodeName === 'SELECT'){
            const linkType = set.querySelector("[name='link-type']")?.value;
            const linkAddress = set.querySelector("[name='link-address']")?.value;
            if(linkAddress){
                if(linkAddress.substr(0,7) !== 'http://' && linkAddress.substr(0,8) !== 'https://'){
                    return { 
                        data: null, 
                        errorMsg: 'One or more link is not valid. Please make sure your link starts with http:// or https://'
                    };
                }
                linkArray.push({ 
                    'link_type': linkType, 
                    'link_address': linkAddress
                })  
            }
        }
    }
    if(linkArray.length === 0) {
        return { 
            data: null, 
            errorMsg: 'All the fields are empty!' 
        };
    }
    formattedData.updated_links = linkArray;
    return { 
        data: formattedData, 
        errorMsg: null 
    };
}


export const formatCharacteristics = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: { attribute_id: Number|null, attribute_value_id: Number|null, other_value: String, value: String }[] = [];
    for(const inputEl of inputElementsList){
        let characteristic: { 
            attribute_id: Number|null, 
            attribute_value_id: Number|null, 
            other_value: String, 
            value: String 
        } = { 
            attribute_id: null, 
            attribute_value_id: null, 
            other_value: '', 
            value: '' 
        };
        
        const inputType = inputEl.getAttribute('type');
        if(inputType === 'checkbox' && inputEl.checked){
            characteristic['attribute_id'] = inputEl.getAttribute('attrId') as any as Number;
            characteristic['attribute_value_id'] = inputEl.value as Number;
            characteristic['other_value'] = '';
            characteristic['value'] = '';
            const otherInputField = inputEl.parentElement.nextElementSibling as HTMLInputElement;
            if(otherInputField && otherInputField.classList.contains('does-toggle')){
                characteristic['other_value'] = otherInputField.value;
                if(characteristic['other_value'].trim() === ''){
                    otherInputField.style.border = '2px solid red';
                    return { 
                        data: null, 
                        errorMsg: 'Please specify a value if you have checked the other field.' 
                    };
                }
                else otherInputField.style.border = '1px solid #ccc';
            }
            formattedData.push(characteristic);
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatGeoScopeForm = (geoScopeElement: ElementRef, selectedGeoScope: string) => {
    const forms = geoScopeElement.nativeElement.querySelectorAll(`[geogroup="${selectedGeoScope}"]`);
    const formData:{}[] = [];

    for(let currentForm of forms){
        let currentFormData = {};

        for(let inputEl of currentForm.elements){
            if(inputEl.getAttribute('name')) {
                const fieldName = inputEl.getAttribute('name');
                const fieldValue = inputEl.value || '';
                
                if(inputEl.hasAttribute('latlong')){
                    currentFormData[fieldName] = { 
                        lat: fieldValue === '' ? 0 : fieldValue.split(',')[0],
                        long: fieldValue === '' ? 0 : fieldValue.split(',')[1]
                    };
                }
                else if(inputEl.hasAttribute('delimiter')){
                    const delimiter = inputEl.getAttribute('delimiter');
                    currentFormData[fieldName] = fieldValue.split(delimiter);
                }
                else {
                    currentFormData[fieldName] = fieldValue;
                }
                
                // clear the value if the input was disabled by the user while submitting the form
                if(inputEl.hasAttribute('disabled')) {
                    currentFormData[fieldName] = '';
                }
            }
        }
        formData.push(currentFormData);
    }
    return formData;
}


export const formatSpecies = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object[] = [];
    const form = inputElementsList[0].form;
    const speciesSets = form.querySelector('tbody').childNodes;
    for(const set of speciesSets){
        if(set.nodeName === 'TR'){
            const speciesCommonFieldValue = set.querySelector("[name='common']")?.value;
            const speciesScientificFieldValue = set.querySelector("[name='scientific']")?.value;
            if(speciesCommonFieldValue || speciesScientificFieldValue){
                formattedData.push({ 
                    'species_common': speciesCommonFieldValue, 
                    'species_scientific': speciesScientificFieldValue, 
                    'landings': null 
                })  
            }
        }
    }
    if(formattedData.length === 0) {
        return { 
            data: null, 
            errorMsg: 'All the fields are empty!'
        }
    }
    return { 
        data: formattedData, 
        errorMsg: null 
    };
}


export const formatThemeIssues = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else{
                const inputType = inputEl.getAttribute('type');
                const lastTwoCharOfFieldName = fieldName.slice(-2);
                if(inputType === 'checkbox'){
                    if(lastTwoCharOfFieldName === '[]'){
                        const arrayFieldName = fieldName.slice(0, -2);
                        if(inputEl.checked) {     
                            if(formattedData[arrayFieldName]) formattedData[arrayFieldName].push(inputEl.value)
                            else formattedData[arrayFieldName] = [inputEl.value];
                        }
                        else if(!formattedData[arrayFieldName]) formattedData[arrayFieldName] = [];
                    }
                }
                else formattedData[fieldName] = inputEl.value || '';
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}









/************************ WHO'S WHO FORMATTERS *****************************/
export const whoFormsFormatter = (formType: string, inputElementsList: Array<HTMLFormElement>) => {
    const whoTabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['WHO']);
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatWhoBasicInfo(inputElementsList);
        case whoTabLabels[0]: return formatWhoBasicInfo(inputElementsList);
        case whoTabLabels[1]: return formatWhoResearchInfo(inputElementsList)
        case whoTabLabels[2]: return formatThemeIssues(inputElementsList)
        case whoTabLabels[3]: return formatSpecies(inputElementsList)
        case whoTabLabels[4]: return formatExternalLinks(inputElementsList)
    }
}


export const formatWhoBasicInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.nodeName.toLowerCase() === 'select' && inputEl.hasAttribute('multiple')){
                const inputArr = [];
                for(const option of inputEl.options){
                    if(option.selected) inputArr.push(option.value);
                }
                formattedData[fieldName] = inputArr;
            }
            else formattedData[fieldName] = inputEl.value || '';
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatWhoResearchInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else formattedData[fieldName] = inputEl.value || '';
            
            if(formattedData[fieldName] == 'true') formattedData[fieldName] = true;
            if(formattedData[fieldName] == 'false') formattedData[fieldName] = false;

            if(formattedData[fieldName] == '' && isNullable(inputEl.name, PANEL_CODES.WHO)){
                formattedData[fieldName] = null;
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}









/*************************** SOTA FORMATTERS *******************************/
export const sotaFormsFormatter = (formType: string, inputElementsList: Array<HTMLFormElement>) => {
    const sotaTabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['SOTA']);
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatSotaInitialInfo(inputElementsList);
        case sotaTabLabels[0]: return formatSotaBasicInfo(inputElementsList);
        case sotaTabLabels[1]: return formatThemeIssues(inputElementsList);
        case sotaTabLabels[2]: return formatCharacteristics(inputElementsList);
        case sotaTabLabels[3]: return formatSotaAdditionalDetails(inputElementsList);
        case sotaTabLabels[4]: return formatSpecies(inputElementsList);
        case sotaTabLabels[5]: return formatExternalLinks(inputElementsList);
    }
}


export const formatSotaInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatSotaBasicInfo(inputElementsList);
    return formatted.data;
}


export const formatSotaBasicInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else{
                const lastTwoCharOfFieldName = fieldName.slice(-2);
                if(lastTwoCharOfFieldName === '[]'){
                    const arrayFieldName = fieldName.slice(0, -2);
                    const delimiter = inputEl.getAttribute('delimiter');
                    const delimiterSeparated = inputEl.value.split(delimiter);
                    const trimmedValues = delimiterSeparated.map((val: string) => val.trim());
                    formattedData[arrayFieldName] = trimmedValues;
                }
                else formattedData[fieldName] = inputEl.value;
            }

            if(formattedData[fieldName] == '' && isNullable(inputEl.name, PANEL_CODES.SOTA)){
                formattedData[fieldName] = null;
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatSotaAdditionalDetails = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const inputType = inputEl.getAttribute('type');
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else{
                if(inputType === 'checkbox'){
                    if(inputEl.checked) formattedData[fieldName] = inputEl.value;
                    else formattedData[fieldName] = inputEl.getAttribute('defaultValue');
                }
                else formattedData[fieldName] = inputEl.value || '';
                
                if(formattedData[fieldName] == 'true') formattedData[fieldName] = true;
                if(formattedData[fieldName] == 'false') formattedData[fieldName] = false;
            }
            
            if(formattedData[fieldName] == '' && isNullable(inputEl.name, PANEL_CODES.SOTA)){
                formattedData[fieldName] = null;
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}









/*************************** PROFILE FORMATTERS *******************************/
export const profileFormsFormatter = (formType: string, formElement: ElementRef) => {
    const inputElementsList = formElement.nativeElement.elements;
    const profileTabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['PROFILE']);
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatProfileInitialInfo(inputElementsList);
        case profileTabLabels[0]: return formatProfileBasicInfo(inputElementsList);
        case profileTabLabels[1]: return formatProfileCharacteristics(inputElementsList);
        case profileTabLabels[2]: return formatSpecies(inputElementsList);
        case profileTabLabels[3]: return formatProfileOrganization(formElement);
        case profileTabLabels[4]: return formatExternalLinks(inputElementsList);
        case profileTabLabels[5]: return formatSoucesCommentsLinks(inputElementsList);
    }
}


export const formatProfileInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatProfileBasicInfo(inputElementsList);
    return formatted.data;
}


export const formatProfileBasicInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else formattedData[fieldName] = inputEl.value;
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatProfileCharacteristics = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: { attribute_id: String, attribute_value_id: String, other_value: String, value: String }[] = [];
    for(const inputEl of inputElementsList){
        let characteristic: { 
            attribute_id: String, 
            attribute_value_id: String, 
            other_value: String, 
            value: String 
        } = { 
            attribute_id: '', 
            attribute_value_id: '', 
            other_value: '', 
            value: '' 
        };
        
        const inputType = inputEl.getAttribute('type');
        if(inputType === 'checkbox' && inputEl.checked){
            characteristic['attribute_id'] = inputEl.getAttribute('attrId');
            characteristic['attribute_value_id'] = inputEl.value;
            characteristic['other_value'] = '';
            characteristic['value'] = '';
            const otherInputField = inputEl.parentElement.nextElementSibling as HTMLInputElement;
            if(otherInputField && otherInputField.hasAttribute('otherValue')){
                characteristic['other_value'] = otherInputField.value;
                if(characteristic['other_value'].trim() === ''){
                    otherInputField.style.border = '2px solid red';
                    return { 
                        data: null, 
                        errorMsg: 'Please specify a value if you have checked the other field.' 
                    };
                }
                else otherInputField.style.border = '1px solid #ccc';
            }
            
            const unitValue = inputEl.closest('td');
            if(unitValue){
                const unitFieldValue = unitValue.nextElementSibling.querySelector('[unitValue]') as HTMLInputElement;
                if(unitFieldValue) characteristic['value'] = unitFieldValue.value;
            }
            formattedData.push(characteristic);
        }
        
        else if(inputType === 'text' && inputEl.hasAttribute('textOnly')){
            characteristic['attribute_id'] = inputEl.getAttribute('attrId');
            characteristic['attribute_value_id'] = '';
            characteristic['other_value'] = '';
            characteristic['value'] = inputEl.value || '';
            formattedData.push(characteristic);
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatProfileOrganization = (formElement: ElementRef) => {
    const profileOrganizationSection = (formElement.nativeElement as HTMLElement).querySelectorAll('[profileOrganizationSection]');
    const formattedData: Object[] = [];
    for(const section of Array.from(profileOrganizationSection)){
        const profOrgData: Object = {};
        const selectOrganizationSection = section.querySelector("[organizationExist='true'");
        const otherOrganizationSection = section.querySelector("[organizationExist='false'");
        if(selectOrganizationSection.getAttribute('isActive') == 'true'){
            const inputEl: HTMLFormElement = section.querySelector('[name]');
            profOrgData['ssforganization'] = inputEl.value;
            profOrgData['organization_name'] = '';
            profOrgData['organization_type'] = '';
            profOrgData['organization_type_other_text'] = '';
            profOrgData['geographic_scope'] = '';
        }
        else{
            const inputElementsList: NodeListOf<HTMLFormElement> = otherOrganizationSection.querySelectorAll('[name]');
            profOrgData['ssforganization'] = '';
            for(const inputEl of Array.from(inputElementsList)){
                const fieldName = inputEl.getAttribute('name');
                if(inputEl.hasAttribute('disabled')) profOrgData[fieldName] = '';
                else profOrgData[fieldName] = inputEl.value;
            }
        }
        formattedData.push(profOrgData);
    }
    return { data: formattedData, errorMsg: null };
}


export const formatSoucesCommentsLinks = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            formattedData[fieldName] = inputEl.value;
        }
    }
    return { data: formattedData, errorMsg: null };
}









/************************* ORGANIZATION FORMATTERS *****************************/
export const organizationFormsFormatter = (formType: string, formElement: ElementRef) => {
    const inputElementsList = formElement.nativeElement.elements;
    const organizationTabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['ORGANIZATION']);
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatOrganizationInitialInfo(inputElementsList);
        case organizationTabLabels[0]: return formatOrganizationBasicInfo(inputElementsList);
        case organizationTabLabels[1]: return formatThemeIssues(inputElementsList);
        case organizationTabLabels[2]: return formatExternalLinks(inputElementsList);
    }
}


export const formatOrganizationInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatOrganizationBasicInfo(inputElementsList);
    return formatted.data;
}


export const formatOrganizationBasicInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const inputType = inputEl.getAttribute('type');
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else{
                if(inputType === 'checkbox'){
                    if(inputEl.checked) formattedData[fieldName] = inputEl.value;
                    else formattedData[fieldName] = inputEl.getAttribute('defaultValue');
                }
                else formattedData[fieldName] = inputEl.value || '';
                
                if(formattedData[fieldName] == 'true') formattedData[fieldName] = true;
                if(formattedData[fieldName] == 'false') formattedData[fieldName] = false;
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}









/*************************** CASESTUDIES FORMATTERS *******************************/
export const caseStudiesFormsFormatter = (formType: string, formElement: ElementRef) => {
    const inputElementsList = formElement.nativeElement.elements;
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatCasestudiesInitialInfo(inputElementsList);
        default: return formatCasestudiesInfo(inputElementsList);
    }
}


export const formatCasestudiesInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatCasestudiesInfo(inputElementsList);
    return formatted.data;
}


export const formatCasestudiesInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else formattedData[fieldName] = inputEl.value;
        }
    }
    return { data: formattedData, errorMsg: null };
}









/************************* BLUEJUSTICE FORMATTERS *****************************/
export const bluejusticesFormsFormatter = (formType: string, formElement: ElementRef) => {
    const inputElementsList = formElement.nativeElement.elements;
    const bluejusticeTabLabels = Array.from(DETAILS_ACCORDIONS_LABELS['BLUEJUSTICE']);
    switch(formType){
        case INITIAL_CONTRIBUTION: return formaBluejusticeInitialInfo(inputElementsList);
        case bluejusticeTabLabels[0]: return formatBluejusticeBasicInfo(inputElementsList);
        case bluejusticeTabLabels[1]: return formatBluejusticeGeneralAndSocialInfo(inputElementsList);
        case bluejusticeTabLabels[2]: return formatBluejusticeGeneralAndSocialInfo(inputElementsList);
        case bluejusticeTabLabels[3]: return formatBluejusticeImageInfo(inputElementsList);
    }
}


export const formaBluejusticeInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatBluejusticeBasicInfo(inputElementsList);
    return formatted.data;
}


export const formatBluejusticeBasicInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else formattedData[fieldName] = inputEl.value;
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatBluejusticeGeneralAndSocialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const inputType = inputEl.getAttribute('type');
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else{
                if(inputType === 'checkbox'){
                    if(inputEl.checked) formattedData[fieldName] = inputEl.value;
                    else formattedData[fieldName] = '';
                }
                else formattedData[fieldName] = inputEl.value || '';
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}


export const formatBluejusticeImageInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formData = new FormData(); 
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            const fieldType = inputEl.getAttribute('type');
            if(fieldType === 'file'){
                if(inputEl.files[0]){
                    const file = inputEl.files[0];
                    const fileName = file ? Date.now() + '-' + file.name : null;
                    formData.append(fieldName, file, fileName);
                }
                else formData.append(fieldName, '');
            }
            else formData.append(fieldName, inputEl.value);
        }
    }
    return { data: formData, errorMsg: null };
}









/*************************** GUIDELINES FORMATTERS *******************************/
export const guidelinesFormsFormatter = (formType: string, formElement: ElementRef) => {
    const inputElementsList = formElement.nativeElement.elements;
    switch(formType){
        case INITIAL_CONTRIBUTION: return formatGuidelinesInitialInfo(inputElementsList);
        default: return formatGuidelinesInfo(inputElementsList);
    }
}


export const formatGuidelinesInitialInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formatted: {data: any, errorMsg: string} = formatGuidelinesInfo(inputElementsList);
    return formatted.data;
}


export const formatGuidelinesInfo = (inputElementsList: Array<HTMLFormElement>) => {
    const formattedData: Object = {};
    for(const inputEl of inputElementsList){
        if(inputEl.getAttribute('name')){
            const fieldName = inputEl.getAttribute('name');
            if(inputEl.hasAttribute('disabled')) formattedData[fieldName] = '';
            else formattedData[fieldName] = inputEl.value;
        
            if(formattedData[fieldName] == '' && isNullable(inputEl.name, PANEL_CODES.GUIDELINES)){
                formattedData[fieldName] = null;
            }
        }
    }
    return { data: formattedData, errorMsg: null };
}