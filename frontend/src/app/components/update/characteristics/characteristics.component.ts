import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
    CHARACTERISTICS_TYPES,
    CHARACTERISTICS_ECOTYPES,
    CHARACTERISTICS_ECOTYPES_DETAILS,
    CHARACTERISTICS_LABELS,
    CHARACTERISTICS_TERMS_USED,
    CHARACTERISTICS_GEARS,
    CHARACTERISTICS_MARKET_DISTRIBUTION,
    CHARACTERISTICS_GOVERNANCE,
    CHARACTERISTICS_REGULATIONS
} from '../../../constants/constants';
import { objectsToArray, toggleSection } from '../../../helpers/helpers';


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
    characteristicsLabels: CHARACTERISTICS_LABELS = CHARACTERISTICS_LABELS;

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


    getOtherValue(types: Object, lookUpKey: string): string|null {
        const lookUpArr: string[] = objectsToArray(types['options'], 'title');
        const indexOfLookUpArr = this.characteristics.categories.indexOf(this.characteristicsLabels[lookUpKey]);
        if(indexOfLookUpArr === -1) return null;

        const valueArr = this.characteristics.values[indexOfLookUpArr];
        const otherValues = valueArr.filter((value: string) => lookUpArr.indexOf(value) === -1);
        if(otherValues.length > 0) return otherValues[0];
        return null;
    }


    objectsToArray(objs:Object[], key: string): any[] {
        return objectsToArray(objs, key);
    }


    shouldCheckItem(item: string, key: string): boolean {
        const lookUpKey = this.characteristicsLabels[key];
        const indexOfLookUpArr = this.characteristics.categories.indexOf(lookUpKey);
        if(indexOfLookUpArr === -1) return false;
        const lookUpArr = this.characteristics.values[indexOfLookUpArr];
        return lookUpArr.includes(item);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}
