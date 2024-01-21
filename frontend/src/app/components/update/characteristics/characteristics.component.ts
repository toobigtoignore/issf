import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
    CHARACTERISTICS_LABELS,
    CHARACTERISTICS_TYPES,
    CHARACTERISTICS_ECOTYPES,
    CHARACTERISTICS_ECOTYPES_DETAILS,
    CHARACTERISTICS_TERMS_USED,
    CHARACTERISTICS_GEARS,
    CHARACTERISTICS_MARKET_DISTRIBUTION,
    CHARACTERISTICS_GOVERNANCE,
    CHARACTERISTICS_REGULATIONS,
    CHARACTERISTICS_MAIN_SSF_VESSEL,
    CHARACTERISTICS_MAJOR_CONCERNS,
    CHARACTERISTICS_POST_HARVEST,
    CHARACTERISTICS_NON_FISHING_ACTIVITIES,
    CHARACTERISTICS_SSF_NUMBER_OF_YEARS,
    CHARACTERISTICS_PROPERTY_RIGHTS,
    CHARACTERISTICS_MEMBERS_OF_SOCIETY,
    CHARACTERISTICS_IS_FISHING_CONSIDERED,
    CHARACTERISTICS_ACCESS,
    CHARACTERISTICS_AVG_VESSEL_LENGTH,
    CHARACTERISTICS_ENGINE_SIZE,
    CHARACTERISTICS_CREW_NUMBER,
    CHARACTERISTICS_FISHING_DAY_PER_YEAR,
    CHARACTERISTICS_FISHERS_NUMBER,
    CHARACTERISTICS_FULL_TIME_FISHERS_NUMBER,
    CHARACTERISTICS_WOMEN_PERCENT,
    CHARACTERISTICS_HOUSEHOLD_NUMBER,
    CHARACTERISTICS_HOUSEHOLD_PERCENT,
    CHARACTERISTICS_HOUSEHOLD_INCOME_PERCENT,
    CHARACTERISTICS_WOMEN_POST_HARVEST_PERCENT,
    CHARACTERISTICS_CHILDREN_POST_HARVEST_PERCENT,
    CHARACTERISTICS_GDP
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

    characteristicsLabels: CHARACTERISTICS_LABELS = CHARACTERISTICS_LABELS;
    characteristicsTypes: CHARACTERISTICS_TYPES = CHARACTERISTICS_TYPES;
    characteristicsEcoTypes: CHARACTERISTICS_ECOTYPES = CHARACTERISTICS_ECOTYPES;
    characteristicsEcoTypesDetails: CHARACTERISTICS_ECOTYPES_DETAILS = CHARACTERISTICS_ECOTYPES_DETAILS;
    characteristicsTermsUsed: CHARACTERISTICS_TERMS_USED = CHARACTERISTICS_TERMS_USED;
    characteristicsGears: CHARACTERISTICS_GEARS = CHARACTERISTICS_GEARS;
    characteristicsVessels: CHARACTERISTICS_MAIN_SSF_VESSEL = CHARACTERISTICS_MAIN_SSF_VESSEL;
    characteristicsVesselsAvgLength: CHARACTERISTICS_AVG_VESSEL_LENGTH = CHARACTERISTICS_AVG_VESSEL_LENGTH;
    characteristicsEngineSize: CHARACTERISTICS_ENGINE_SIZE = CHARACTERISTICS_ENGINE_SIZE;
    characteristicsCrewNumber: CHARACTERISTICS_CREW_NUMBER = CHARACTERISTICS_CREW_NUMBER;
    characteristicsFishingDayPerYear: CHARACTERISTICS_FISHING_DAY_PER_YEAR = CHARACTERISTICS_FISHING_DAY_PER_YEAR;
    characteristicsFishersNumber: CHARACTERISTICS_FISHERS_NUMBER = CHARACTERISTICS_FISHERS_NUMBER
    characteristicsFullTimeFishersNumber: CHARACTERISTICS_FULL_TIME_FISHERS_NUMBER = CHARACTERISTICS_FULL_TIME_FISHERS_NUMBER;
    characteristicsWomenPercent: CHARACTERISTICS_WOMEN_PERCENT = CHARACTERISTICS_WOMEN_PERCENT;
    characteristicsHouseholdsNumber: CHARACTERISTICS_HOUSEHOLD_NUMBER = CHARACTERISTICS_HOUSEHOLD_NUMBER;
    characteristicsHouseholdsPercent: CHARACTERISTICS_HOUSEHOLD_PERCENT = CHARACTERISTICS_HOUSEHOLD_PERCENT;
    characteristicsHouseholdsIncomePercent: CHARACTERISTICS_HOUSEHOLD_INCOME_PERCENT = CHARACTERISTICS_HOUSEHOLD_INCOME_PERCENT;
    characteristicsPostHarvest: CHARACTERISTICS_POST_HARVEST = CHARACTERISTICS_POST_HARVEST;
    characteristicsWomenPostHarvestPercent: CHARACTERISTICS_WOMEN_POST_HARVEST_PERCENT = CHARACTERISTICS_WOMEN_POST_HARVEST_PERCENT;
    characteristicsChildrenPostHarvestPercent: CHARACTERISTICS_CHILDREN_POST_HARVEST_PERCENT = CHARACTERISTICS_CHILDREN_POST_HARVEST_PERCENT;
    characteristicsGDP: CHARACTERISTICS_GDP = CHARACTERISTICS_GDP;
    characteristicsNonFishing: CHARACTERISTICS_NON_FISHING_ACTIVITIES = CHARACTERISTICS_NON_FISHING_ACTIVITIES;
    characteristicsMarketDistribution: CHARACTERISTICS_MARKET_DISTRIBUTION = CHARACTERISTICS_MARKET_DISTRIBUTION;
    characteristicsNumberOfYears: CHARACTERISTICS_SSF_NUMBER_OF_YEARS = CHARACTERISTICS_SSF_NUMBER_OF_YEARS;
    characteristicsMembersOfSociety: CHARACTERISTICS_MEMBERS_OF_SOCIETY = CHARACTERISTICS_MEMBERS_OF_SOCIETY;
    characteristicsFishingConsidered: CHARACTERISTICS_IS_FISHING_CONSIDERED = CHARACTERISTICS_IS_FISHING_CONSIDERED;
    characteristicsGovernance: CHARACTERISTICS_GOVERNANCE = CHARACTERISTICS_GOVERNANCE;
    characteristicsPropertyRights: CHARACTERISTICS_PROPERTY_RIGHTS = CHARACTERISTICS_PROPERTY_RIGHTS;
    characteristicsAccess: CHARACTERISTICS_ACCESS = CHARACTERISTICS_ACCESS;
    characteristicsRegulations: CHARACTERISTICS_REGULATIONS = CHARACTERISTICS_REGULATIONS;
    characteristicsMajorConcerns: CHARACTERISTICS_MAJOR_CONCERNS = CHARACTERISTICS_MAJOR_CONCERNS;

    characteristicsTypesOptions = Object.keys(this.characteristicsTypes.options);
    characteristicsEcoTypesOptions = Object.keys(this.characteristicsEcoTypes.options);
    characteristicsEcoTypesDetailsOptions = Object.keys(this.characteristicsEcoTypesDetails.options);
    characteristicsTermsUsedOptions = Object.keys(this.characteristicsTermsUsed.options);
    characteristicsGearsOptions = Object.keys(this.characteristicsGears.options);
    characteristicsVesselsOptions = Object.keys(this.characteristicsVessels.options);
    characteristicsPostHarvestOptions = Object.keys(this.characteristicsPostHarvest.options);
    characteristicsNonFishingOptions = Object.keys(this.characteristicsNonFishing.options);
    characteristicsMarketDistributionOptions = Object.keys(this.characteristicsMarketDistribution.options);
    characteristicsNumberOfYearsOptions = Object.keys(this.characteristicsNumberOfYears.options);
    characteristicsMembersOfSocietyOptions = Object.keys(this.characteristicsMembersOfSociety.options);
    characteristicsFishingConsideredOptions = Object.keys(this.characteristicsFishingConsidered.options);
    characteristicsGovernanceOptions = Object.keys(this.characteristicsGovernance.options);
    characteristicsPropertyRightsOptions = Object.keys(this.characteristicsPropertyRights.options);
    characteristicsAccessOptions = Object.keys(this.characteristicsAccess.options);
    characteristicsRegulationsOptions = Object.keys(this.characteristicsRegulations.options);
    characteristicsMajorConcernsOptions = Object.keys(this.characteristicsMajorConcerns.options);


    constructor() { }


    ngOnInit(): void { }


    findTextualValue(key: string): string{
        const label = this.characteristicsLabels[key];
        const index = this.characteristics.categories.indexOf(label);
        if(index === -1) return '';
        const targetValueObj = this.characteristics.values[index][0];
        return targetValueObj ? targetValueObj.value : '';
    }


    getAdditionalValue(value: string, lookUpKey: string): string {
      const indexOfLookUpArr = this.characteristics.categories.indexOf(this.characteristicsLabels[lookUpKey]);
      if(indexOfLookUpArr === -1) return '';

      const valueArr = this.characteristics.values[indexOfLookUpArr];
      return valueArr.filter(item => item.value === value)[0]?.additional || '';
    }


    getOtherValue(types: Object, lookUpKey: string): string|null {
        const lookUpArr: string[] = objectsToArray(types['options'], 'title');
        const indexOfLookUpArr = this.characteristics.categories.indexOf(this.characteristicsLabels[lookUpKey]);
        if(indexOfLookUpArr === -1) return null;

        const valueArr = this.characteristics.values[indexOfLookUpArr].map(item => item.value);
        const otherValues = valueArr.filter((value: string) => lookUpArr.indexOf(value) === -1);
        if(otherValues.length > 0) return otherValues[0];
        return null;
    }


    inArray(key: string, arr: string[]): boolean {
        if(arr.indexOf(key) !== -1) return true;
        return false;
    }


    objectsToArray(objs:Object[], key: string): any[] {
        return objectsToArray(objs, key);
    }


    shouldCheckItem(item: string, key: string): boolean {
        const lookUpKey = this.characteristicsLabels[key];
        const indexOfLookUpArr = this.characteristics.categories.indexOf(lookUpKey);
        if(indexOfLookUpArr === -1) return false;
        const lookUpArr = this.characteristics.values[indexOfLookUpArr].map(item => item.value);
        return lookUpArr.includes(item);
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}
