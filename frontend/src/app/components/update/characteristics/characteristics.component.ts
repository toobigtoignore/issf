import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { 
    CHARACTERISTICS_TYPES,
    CHARACTERISTICS_ECOTYPES,
    CHARACTERISTICS_ECOTYPES_DETAILS,
    CHARACTERISTICS_TERMS_USED,
    CHARACTERISTICS_GEARS,
    CHARACTERISTICS_MARKET_DISTRIBUTION,
    CHARACTERISTICS_GOVERNANCE,
    CHARACTERISTICS_REGULATIONS
} from '../../../constants/constants';
import { getOtherValue, objectsToArray, toggleSection } from '../../../helpers/helpers';


@Component({
    selector: 'app-characteristics',
    templateUrl: './characteristics.component.html',
    styleUrls: ['./characteristics.component.css']
})


export class CharacteristicsComponent implements OnInit {
    @ViewChild('characteristicsHolder', {static: true}) characteristicsHolder: ElementRef;
    @Input() characteristics: any;
    
    characteristicsTypes: CHARACTERISTICS_TYPES = CHARACTERISTICS_TYPES;
    characteristicsEcoTypes: CHARACTERISTICS_ECOTYPES = CHARACTERISTICS_ECOTYPES;
    characteristicsEcoTypesDetails: CHARACTERISTICS_ECOTYPES_DETAILS = CHARACTERISTICS_ECOTYPES_DETAILS;
    characteristicsTermsUsed: CHARACTERISTICS_TERMS_USED = CHARACTERISTICS_TERMS_USED;
    characteristicsGears: CHARACTERISTICS_GEARS = CHARACTERISTICS_GEARS;
    characteristicsMarketDistribution: CHARACTERISTICS_MARKET_DISTRIBUTION = CHARACTERISTICS_MARKET_DISTRIBUTION;
    characteristicsGovernance: CHARACTERISTICS_GOVERNANCE = CHARACTERISTICS_GOVERNANCE;
    characteristicsRegulations: CHARACTERISTICS_REGULATIONS = CHARACTERISTICS_REGULATIONS;

    characteristicsTypesOptions = Object.keys(this.characteristicsTypes.options);
    characteristicsEcoTypesOptions = Object.keys(this.characteristicsEcoTypes.options);
    characteristicsEcoTypesDetailsOptions = Object.keys(this.characteristicsEcoTypesDetails.options);
    characteristicsTermsUsedOptions = Object.keys(this.characteristicsTermsUsed.options);
    characteristicsGearsOptions = Object.keys(this.characteristicsGears.options);
    characteristicsMarketDistributionOptions = Object.keys(this.characteristicsMarketDistribution.options);
    characteristicsGovernanceOptions = Object.keys(this.characteristicsGovernance.options);
    characteristicsRegulationsOptions = Object.keys(this.characteristicsRegulations.options);

    
    constructor() { }

    
    ngOnInit(): void { }


    getOtherValue(valueArr: string[], lookUpArr: string[]): string|null {
        return getOtherValue(valueArr, lookUpArr);
    }


    inArray(key: string, arr: string[]): boolean {
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    objectsToArray(objs:Object[], key: string): any[] {
        return objectsToArray(objs, key);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}