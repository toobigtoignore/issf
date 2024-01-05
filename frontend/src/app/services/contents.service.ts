import { PANEL_CODES, PANEL_VALUES } from '../constants/constants';


export class Contents {
	private visThumbContent = [
        { id: 1, vis: "governance", description: "This visualisation shows various governance types by country based on the contributed records." },
        { id: 2, vis: "gear", description: "This visualisation shows vessel or gear types information by country or region." },
        { id: 3, vis: "bluejustice", description: "This visualisation shows different types of injustice to small-scale fisheries in various locations." },
        { id: 4, vis: "state-of-the-art-research", description: "This visualization shows top 12 countries with the highest number of total themes." },
        { id: 5, vis: "mshare", description: "Distribution of SSF products in the market chain, based on contributed records in ISSF" },
        { id: 6, vis: "wiw", description: "This visualisation shows the number of researchers in different countries." },
        { id: 7, vis: "state-of-the-art-research-2", description: "This visualization shows themes covered in SSF research in various countries." }
	];


    private panelList = [
        { code: PANEL_CODES.WHO, label: PANEL_VALUES.WHO, icon:'/assets/img/icons/panels/icon-who.png' },
        { code: PANEL_CODES.SOTA, label: PANEL_VALUES.SOTA, icon:'/assets/img/icons/panels/icon-sota.png' },
        { code: PANEL_CODES.PROFILE, label: PANEL_VALUES.PROFILE, icon:'/assets/img/icons/panels/icon-profile.png' },
        { code: PANEL_CODES.ORGANIZATION, label: PANEL_VALUES.ORGANIZATION, icon:'/assets/img/icons/panels/icon-organization.png' },
        { code: PANEL_CODES.CASESTUDY, label: PANEL_VALUES.CASESTUDY, icon:'/assets/img/icons/panels/icon-case.png' },
        // { code: PANEL_CODES.GOVERNANCE, label: PANEL_VALUES.GOVERNANCE, icon:'/assets/img/icons/panels/icon-governance.png' },
        { code: PANEL_CODES.BLUEJUSTICE, label: PANEL_VALUES.BLUEJUSTICE, icon:'/assets/img/icons/panels/icon-bluejustice.png' },
        { code: PANEL_CODES.GUIDELINES, label: PANEL_VALUES.GUIDELINES, icon:'/assets/img/icons/panels/icon-guidelines.png' }
    ];


    private countryList = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic People's Republic of Korea", "Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mexico", "Micronesia (Federated States of)", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of Korea", "Moldova", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Thailand", "Macedonia", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United Republic of Tanzania", "United States of America", "Uruguay", "U.S. Minor Islands", "Uzbekistan", "Vanuatu", "Venezuela (Bolivarian Republic of)", "Viet Nam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Yemen", "Zambia", "Zimbabwe"];


    private months = [
        { num: 1, name: 'January', day: 31 },
        { num: 2, name: 'February', day: 29 },
        { num: 3, name: 'March', day: 31 },
        { num: 4, name: 'April', day: 30 },
        { num: 5, name: 'May', day: 31 },
        { num: 6, name: 'June', day: 30 },
        { num: 7, name: 'July', day: 31 },
        { num: 8, name: 'August', day: 31 },
        { num: 9, name: 'September', day: 30 },
        { num: 10, name: 'October', day: 31 },
        { num: 11, name: 'November', day: 30 },
        { num: 12, name: 'December', day: 31 }
    ];


	constructor(){}


	public getPanelList(){
		return this.panelList;
	}


	public getPanelCodeFromLabel(panelLabel:string){
		return this.panelList
                    .find(panelRow => panelRow.label === panelLabel)
                    .code;
	}


	public getPanelLabelFromCode(panelCode:string){
		return this.panelList
                    .find(panelRow => panelRow.code === panelCode)
                    .label;
	}


	public getPanelIconFromCode(panelCode:string){
		return this.panelList
                    .find(panelRow => panelRow.code === panelCode)
                    .icon;
	}


	public getPanelIconFromLabel(panelLabel: string){
		return this.panelList
                   .find(panelRow => panelRow.label === panelLabel)
                   .icon;
	}


	public getCountryList(){
		return this.countryList;
	}


	public getMonths(){
		return this.months;
	}


	public getVisContent(){
		return this.visThumbContent;
	}


    public getContentForGallery() {
        let slideNum: number = 0;
        let slidePerView: number = 4;
        let section: Object[] = [];
        let sections: Array<Object[]> = [];

        this.visThumbContent.map((slide, index) => {
            section.push(slide);
            slideNum++;
            if(slideNum > slidePerView - 1 || index === this.visThumbContent.length - 1){
                sections.push(section);
                slideNum = 0;
                section = [];
            }
        });
        return sections;
    }
}
