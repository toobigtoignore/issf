import { Component, Input, OnInit } from '@angular/core';
import { THEME_ECONOMICS, THEME_ECOLOGICAL, THEME_GOVERNANCE, THEME_SOCIALS } from '../../../constants/constants';
import { getOtherValue, objectsToArray, toggleSection } from '../../../helpers/helpers';


@Component({
    selector: 'app-theme',
    templateUrl: './theme.component.html',
    styleUrls: ['./theme.component.css']
})


export class ThemeComponent implements OnInit {
    @Input() themes: any;
    
    themeEconomics: THEME_ECONOMICS = THEME_ECONOMICS;
    themeEconomicsOptions = Object.keys(this.themeEconomics.options);
    themeEcological: THEME_ECOLOGICAL = THEME_ECOLOGICAL;
    themeEcologicalOptions = Object.keys(this.themeEcological.options);
    themeSocials: THEME_SOCIALS = THEME_SOCIALS;
    themeSocialsOptions = Object.keys(this.themeSocials.options);
    themeGovernance: THEME_GOVERNANCE = THEME_GOVERNANCE;
    themeGovernanceOptions = Object.keys(this.themeGovernance.options);

    
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
