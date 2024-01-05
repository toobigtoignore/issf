import { GS_OPTIONS } from '../../../constants/constants';


const initializedForms = {
    localForms: {
        type: GS_OPTIONS.LOCAL,
        areaNames: [''],
        alternateNames: [''],
        countryCodes: [],
        areaSettings: [''],
        mapPoints: [''],
        numberOfScope: 1
    },

    subnationalForms: {
        type: GS_OPTIONS.SUB_NATIONAL,
        subnationNames: [''],
        subnationCountries: [],
        subnationTypes: [''],
        mapPoints: [''],
        numberOfScope: 1
    },

    regionalForms: {
        type: GS_OPTIONS.REGIONAL,
        regions: [''],
        countries: [''],
        mapPoints: [''],
        numberOfScope: 1
    },

    nationalForm: {
        type: GS_OPTIONS.NATIONAL,
        country: ''
    }
}


export default initializedForms;