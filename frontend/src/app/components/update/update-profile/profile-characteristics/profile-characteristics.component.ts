import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { 
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
} from '../../../../constants/constants';
import { getOtherValue, objectsToArray, toggleSection } from '../../../../helpers/helpers';


@Component({
    selector: 'app-profile-characteristics',
    templateUrl: './profile-characteristics.component.html',
    styleUrls: ['./profile-characteristics.component.css']
})


export class ProfileCharacteristicsComponent implements OnInit {
    @ViewChild('characteristicsHolder', {static: true}) characteristicsHolder: ElementRef;
    @Input() characteristicsLabels: any;
    @Input() characteristicsValues: any;
    
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


    fetchUnitValue(title: string, label: string): string{
        const index = this.characteristicsLabels.indexOf(label);
        const fetchedCharacteristics = this.characteristicsValues[index];
        for(const fc of fetchedCharacteristics){
            const splittedValue = fc.split('|');
            if(splittedValue[0] === title){
                if(splittedValue[1]) return splittedValue[1];
                else return ''
            }
        }
    }


    findOtherValue(characteristicsOptions: any[], label: string): string|null{
        let otherValue: string|null = null;
        const optionValues: string[] = [];
        const index = this.characteristicsLabels.indexOf(label);
        const fetchedCharacteristics = this.characteristicsValues[index];
        characteristicsOptions.map(option => optionValues.push(option.title));
        for(const fc of fetchedCharacteristics){
            const characteristicTitle = fc.split('|')[0];
            if(!this.inArray(characteristicTitle, optionValues)) {
                otherValue = characteristicTitle;
                break;
            }
        }
        return otherValue;
    }


    fetchOtherUnitValue(characteristicsOptions: any[], label: string): string{
        let otherUnitValue: string = '';
        const optionValues: string[] = [];
        const index = this.characteristicsLabels.indexOf(label);
        const fetchedCharacteristics = this.characteristicsValues[index];
        characteristicsOptions.map(option => optionValues.push(option.title));
        for(const fc of fetchedCharacteristics){
            const characteristicTitle = fc.split('|')[0];
            if(!this.inArray(characteristicTitle, optionValues)) {
                otherUnitValue = fc.split('|')[1];
                break;
            }
        }
        return otherUnitValue;
    }


    findTextualValue(label: string): string{
        const index = this.characteristicsLabels.indexOf(label);
        const values = this.characteristicsValues[index];
        if(values.length > 0){
            const checkForPipe = values[0].split('|');
            if(checkForPipe[1]) return checkForPipe[1];
            else if(checkForPipe[0]) return checkForPipe[0];   
        }
        return '';
    }


    getAdditionalValue(value: string): string {
        const splittedValue = value.split("|");
        if(splittedValue[1]) splittedValue[1];
        return splittedValue[0];
    }


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


    selectionCheck(title: string, characteristic: string): boolean {
        const index = this.characteristicsLabels.indexOf(characteristic);
        const fetchedCharacteristics: string[] = [];
        this.characteristicsValues[index].map((sc:string) => {
            fetchedCharacteristics.push(sc.split('|')[0])
        });
        if(this.inArray(title, fetchedCharacteristics)) return true;
        return false;
    }


    toggleOther(event: Event){
        toggleSection(event);
    }
}