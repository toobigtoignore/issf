import { ElementRef, Injectable } from '@angular/core';


@Injectable()


export class FormatterServices {
    
    
    constructor() { }


    formatDate(date: string, delimiter: string): string | null {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const splittedPieces = date.split(delimiter);
        if(splittedPieces.length > 0){
            const year = splittedPieces[0] || "";
            const date = splittedPieces[2] || "";
            let month = "";
            if(splittedPieces[1]){
                month = months[parseInt(splittedPieces[1]) - 1] + ",";
            }
            return date + " " + month + " " + year;
        }
        return null;
    }


    formatter(formType: string, formEl: ElementRef) {
        switch(formType){
            case 'additional': return this.formattedAdditional(formEl)
            case 'characteristics': return this.formattedCharacteristics(formEl)
            case 'species': return this.formattedSpeciesData(formEl)
            case 'links': return this.formattedExternalLinksData(formEl)
        }
    }


    formattedAdditional(additionalForm: ElementRef){
        const formEl = additionalForm.nativeElement.elements;
        const formattedData: Object = {};
        for(let inputEl of formEl){
            if(inputEl.getAttribute('name') && !inputEl.hasAttribute('disabled')){
                const inputType = inputEl.getAttribute('type');
                const fieldName = inputEl.getAttribute('name');
                if(inputType === 'checkbox'){
                    if(inputEl.checked) formattedData[fieldName] = inputEl.value;
                    else formattedData[fieldName] = inputEl.getAttribute('defaultValue');
                }
                else {
                    if(inputEl.value.trim() === '') formattedData[fieldName] = null;
                    else formattedData[fieldName] = inputEl.value
                }
            }
        }
        return { formattedData: formattedData, errorMsg: null };
    }


    formattedCharacteristics(characteristicsForm: ElementRef){
        const formattedData: { attribute_id: Number|null, attribute_value_id: Number|null, other_value: String, value: String }[] = [];
        const formEl = characteristicsForm.nativeElement.querySelectorAll('input');
        for(let inputItem of formEl){
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
            
            const inputType = inputItem.getAttribute('type');
            if(inputType === 'checkbox' && inputItem.checked){
                characteristic['attribute_id'] = inputItem.getAttribute('attrId') as Number;
                characteristic['attribute_value_id'] = inputItem.value as Number;
                characteristic['other_value'] = '';
                characteristic['value'] = '';
                const otherInputField = inputItem.parentElement.nextElementSibling;
                if(otherInputField.classList.contains('does-toggle')){
                    characteristic['other_value'] = (otherInputField as HTMLInputElement).value;
                    if(characteristic['other_value'].trim() === ''){
                        otherInputField.style.border = '2px solid red';
                        return { 
                            formattedData: null, 
                            errorMsg: 'Please specify a value if you have checked the other field.' 
                        };
                    }
                }
                formattedData.push(characteristic);
            }
        }
        return { formattedData: formattedData, errorMsg: null };
    }


    formattedExternalLinksData(linksForm: ElementRef) {
        const formattedData: { updated_links: Object[] } = { updated_links: [] };
        const linkArray:Object[] = [];
        const formEl = linksForm.nativeElement;
        const linkSets = formEl.querySelector('tbody').childNodes;
        for(const set of linkSets){
            if(set.nodeName === 'TR' || set.nodeName === 'SELECT'){
                const linkType = set.querySelector("[name='link-type']")?.value;
                const linkAddress = set.querySelector("[name='link-address']")?.value;
                if(linkAddress){
                    if(linkAddress.substr(0,7) !== 'http://' && linkAddress.substr(0,8) !== 'https://'){
                        return { 
                            formattedData: null, 
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
                formattedData: null, 
                errorMsg: 'All the fields are empty!' 
            };
        }
        formattedData.updated_links = linkArray;
        return { 
            formattedData: formattedData, 
            errorMsg: null 
        };
    }


    formattedSpeciesData(speciesForm: ElementRef) {
        const formattedData: Object[] = [];
        const formEl = speciesForm.nativeElement;
        const speciesSets = formEl.querySelector('tbody').childNodes;
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
                formattedData: null, 
                errorMsg: 'All the fields are empty!'
            }
        }
        return { 
            formattedData: formattedData, 
            errorMsg: null 
        };
    }
}
