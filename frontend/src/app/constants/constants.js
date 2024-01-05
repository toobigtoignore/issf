export const BLUEJUSTICE_ECOSYSTEM_DETAILED = {
    ecosystem_detailed_archipelago: "Archipelago",
    ecosystem_detailed_beach: "Beach",
    ecosystem_detailed_coastal: "Coastal",
    ecosystem_detailed_coral_reef: "Cora Reef",
    ecosystem_detailed_deep_sea: "Deep Sea",
    ecosystem_detailed_estuary: "Estuary",
    ecosystem_detailed_fjord: "Fjord",
    ecosystem_detailed_intertidal: "Intertidal",
    ecosystem_detailed_lagoon: "Lagoon",
    ecosystem_detailed_lake: "Lake",
    ecosystem_detailed_mangrove: "Mangrove",
    ecosystem_detailed_open_ocean: "Open Ocean",
    ecosystem_detailed_river: "River",
    ecosystem_detailed_salt_marsh: "Salt Marsh"
};


export const BLUEJUSTICE_ECOSYSTEM_TYPE = {
    ecosystem_type_marine: "Marine",
    ecosystem_type_freshwater: "Freshwater",
    ecosystem_type_brackish: "Brackish"
};


export const BLUEJUSTICE_JUSTICE_TYPES = {
    types_of_justice_distributive: {
        label: "Distributive justice",
        additionalText: "(e.g. restricted access to space and resources due, for instance, to other ocean uses like tourism, aquaculture, mining, shipping, MPAs, etc.)"
    },
    types_of_justice_social: {
        label: "Social justice",
        additionalText: "(e.g. imbalanced power and relationship due, for instance, to systems that favors certain sectors and discriminate others in the society)"
    },
    types_of_justice_economic: {
        label: "Economic justice",
        additionalText: "(e.g. inequitable opportunities for growth due, for instance, to unfair distribution of subsidies, credit restriction, product certification schemes, limited access to land, productive assets, and alternative livelihood opportunities, etc.)"
    },
    types_of_justice_market: {
        label: "Market justice",
        additionalText: "(e.g. limited access to trade and markets, due to market certification schemes, or product standards developed without due consideration to SSF context)"
    },
    types_of_justice_infrastructure: {
        label: "Infrastructure/wellbeing justice",
        additionalText: "(e.g. exclusion from access to health, education, judicial services, safe drinking water, and sanitation, poor roads, transportation and lack of IT and communication links, etc.)"
    },
    types_of_justice_regulatory: {
        label: "Regulatory justice",
        additionalText: "(e.g. regulations that lead to unfair competition, including those related to quota allocation, gear use control, legal status, etc.)"
    },
    types_of_justice_procedural: {
        label: "Procedural justice",
        additionalText: "(e.g. restricted access to decision-making due, for instance, to the process that designs without due consideration to the SSF context)"
    },
    types_of_justice_environmental: {
        label: "Environmental justice",
        additionalText: "(e.g. disproportionate effects of industrial pollutant, hazard or waste disposal on low-income, and marginalized communities, compromising the health and wellbeing of their members, etc.)"
    },
    covid_19_related: {
        label: "COVID-19 related justice",
        additionalText: "(e.g. disproportionate effects of COVID-19 pandemic on SSF, lack of recognition about the effects of COVID-19 on SSF; insufficient attention to examine the impacts on SSF communities, inadequate funding or support to mitigate impacts on SSF compared to other sectors, etc.)"
    },
};


export const BLUEJUSTICE_MAINGEARS_TYPE = {
    main_gears_dredge: "Dredge",
    main_gears_lift_net: "Lift Net",
    main_gears_cast_net: "Cast Net",
    main_gears_poison: "Gears Poison",
    main_gears_gillnet: "Gears Gillnet",
    main_gears_recreational_fishing_gears: "Recreational Fishing Gears",
    main_gears_gleaning: "Gears Gleaning",
    main_gears_seine_net: "Seine Net",
    main_gears_harpoon: "Harpoon",
    main_gears_surrounding_net: "Sorrounding Net",
    main_gears_harvesting_machines: "Harvesting Machines",
    main_gears_traps: "Traps",
    main_gears_hook_line: "Hook and Line",
    main_gears_trawls: "Trawls"
};


export const BLUEJUSTICE_SSF_TERMS = {
    ssf_terms_artisanal: "Artisanal",
    ssf_terms_coastal: "Coastal",
    ssf_terms_indigenous: "Indigenous",
    ssf_terms_inland: "Inland",
    ssf_terms_inshore: "Inshore",
    ssf_terms_small_boat: "Small Boat",
    ssf_terms_small_scale: "Small Scale",
    ssf_terms_subsistence: "Subsistence",
    ssf_terms_traditional: "Traditional"
};


export const BLUEJUSTICE_SSF_TYPE = {
    ssf_type_aquaculture: "Aquaculture",
    ssf_type_recreational: "Recreational",
    ssf_type_subsistence: "Subsistence",
    ssf_type_commercial: "Commercial",
    ssf_type_indigenous: "Indigenous"
};


export const CHARACTERISTICS_LABELS = {
    ecoDetailType: "Ecosystem detailed type(s):",
    ecoTypes: "Ecosystem type(s):",
    ssfGovModes: "Governance mode(s) in SSF:",
    ssfKeyRules: "Key rules, regulations, instruments and measures used to manage SSF:",
    mainGears: "Main gear type(s):",
    ssfMarket: "SSF market and distribution channel(s):",
    ssfTypes: "SSF type(s):",
    ssfTerms: "Term(s) used to refer to SSF:"
};


export const CHARACTERISTICS_MAIN_SSF_VESSEL = {
    options: [
        { attrId: 1, attrValue: 1,  title: "(Dugout) canoe" },
        { attrId: 1, attrValue: 2,  title: "Outrigger craft" },
        { attrId: 1, attrValue: 31, title: "Raft" },
        { attrId: 1, attrValue: 34, title: "Dory" },
        { attrId: 1, attrValue: 35, title: "Piroque" },
        { attrId: 1, attrValue: 36, title: "Wooden" },
        { attrId: 1, attrValue: 37, title: "Fibreglass" },
        { attrId: 1, attrValue: 38, title: "Row boat" },
        { attrId: 1, attrValue: 39, title: "Sail boat" },
        { attrId: 1, attrValue: 40, title: "Decked (usually with inboard engine)" },
        { attrId: 1, attrValue: 41, title: "Un-decked/open (with or without inboard engine)" },
    ],
    other: { attrId: 1, attrValue: 3, title: "Other" }
};


export const CHARACTERISTICS_MAJOR_CONCERNS = {
    options: [
        { attrId: 10, attrValue: 23, title: "Ecosystem health (resource/environmental degradation, bycatch, destructive fishing practices, etc.)" },
        { attrId: 10, attrValue: 24, title: "Social justice (access, rights, fairness, equity, displacement, power, etc.)" },
        { attrId: 10, attrValue: 25, title: "Livelihoods (viability, wellbeing, health, etc.)" },
        { attrId: 10, attrValue: 50, title: "Food security (availability, accessibility, safety, etc.)" },
        { attrId: 10, attrValue: 51, title: "Markets (access, price, monopoly, etc.)" },
        { attrId: 10, attrValue: 52, title: "Climate/environmental changes" },
        { attrId: 10, attrValue: 53, title: "Land-based pollution, coastal erosion" },
        { attrId: 10, attrValue: 54, title: "Ocean grabbing, privatization schemes" },
        { attrId: 10, attrValue: 55, title: "Poor governance (lack of accountability, transparency, rules of law, etc.)" },
        { attrId: 10, attrValue: 56, title: "Stakeholder conflicts (between different resource users and interest groups, including conservation and tourism)" },
    ],
    other: { attrId: 10, attrValue: 28, title: "Other" }
};


export const CHARACTERISTICS_POST_HARVEST = {
    options: [
        { attrId: 20, attrValue: 7, title: "Processing (cooking, drying, salting, smoking, etc.)" },
        { attrId: 20, attrValue: 8, title: "Marketing/trading" },
        { attrId: 20, attrValue: 9, title: "Transportation" }
    ]
};


export const CHARACTERISTICS_NON_FISHING_ACTIVITIES = {
    options: [
	    { attrId: 23, attrValue: 10, title: "Farming/cultivation (rice, cassava, corn, vegetables, etc.)" },
	    { attrId: 23, attrValue: 11, title: "Animal/livestock husbandry" },
	    { attrId: 23, attrValue: 12, title: "Small trade" },
	    { attrId: 23, attrValue: 42, title: "Small own-business" },
	    { attrId: 23, attrValue: 43, title: "Tourism-related activities" },
	    { attrId: 23, attrValue: 44, title: "Wage/hired labour" },
    ],
    other: { attrId: 23, attrValue: 132, title: "Other" }
};


export const CHARACTERISTICS_SSF_NUMBER_OF_YEARS = {
    options: [
        { attrId: 24, attrValue: 4, title: "Less than 10 years" },
        { attrId: 24, attrValue: 5, title: "10 to 30 years" },
        { attrId: 24, attrValue: 6, title: "31 to 50 years" },
        { attrId: 24, attrValue: 45, title: "51 to 100 years" },
        { attrId: 24, attrValue: 46, title: "More than 100 years" }
    ]
};


export const CHARACTERISTICS_PROPERTY_RIGHTS = {
    options: [
        { attrId: 25, attrValue: 18, title: "Individual" },
        { attrId: 25, attrValue: 19, title: "Collective/communal" },
        { attrId: 25, attrValue: 29, title: "None" }
    ]
};


export const CHARACTERISTICS_MEMBERS_OF_SOCIETY = {
    options: [
        { attrId: 31, attrValue: 13, title: "Highly (fishers are well recognized for their contributions to the society)" },
        { attrId: 31, attrValue: 14, title: "Moderately (fishers are somewhat recognized for their contributions to the society)" },
        { attrId: 31, attrValue: 15, title: "Poorly (fishers are not at all recognized for their contributions to the society)" }
    ]
};


export const CHARACTERISTICS_IS_FISHING_CONSIDERED = {
    options: [
        { attrId: 32, attrValue: 16, title: "No" },
        { attrId: 32, attrValue: 17, title: "Somewhat" },
        { attrId: 32, attrValue: 47, title: "Yes" }
    ]
};


export const CHARACTERISTICS_ACCESS = {
    options: [
        { attrId: 33, attrValue: 48, title: "Secured" },
        { attrId: 33, attrValue: 49, title: "Not secured" },
    ]
};


export const CHARACTERISTICS_TYPES = {
    options: [
        { attrId: 11, attrValue: 66, title: "Indigenous" },
        { attrId: 11, attrValue: 68, title: "Commercial" },
        { attrId: 11, attrValue: 67, title: "Aquaculture" },
        { attrId: 11, attrValue: 69, title: "Recreational" },
        { attrId: 11, attrValue: 70, title: "Subsistence" }
    ],
    other: { attrId: 11, attrValue: 71, title: "Other" }
};


export const CHARACTERISTICS_ECOTYPES = {
    options: [
        { attrId: 12, attrValue: 87, title: "Marine" },
        { attrId: 12, attrValue: 88, title: "Freshwater" },
        { attrId: 12, attrValue: 89, title: "Brackish" }
    ]
};


export const CHARACTERISTICS_ECOTYPES_DETAILS = {
    options: [
        { attrId: 34, attrValue: 90, title: "Archipelago" },
        { attrId: 34, attrValue: 91, title: "Beach" },
        { attrId: 34, attrValue: 92, title: "Coastal" },
        { attrId: 34, attrValue: 93, title: "Coral reef" },
        { attrId: 34, attrValue: 94, title: "Deep sea" },
        { attrId: 34, attrValue: 95, title: "Estuary" },
        { attrId: 34, attrValue: 96, title: "Fjord" },
        { attrId: 34, attrValue: 97, title: "Inter-tidal" },
        { attrId: 34, attrValue: 98, title: "Lagoon" },
        { attrId: 34, attrValue: 99, title: "Lake" },
        { attrId: 34, attrValue: 100, title: "Mangrove" },
        { attrId: 34, attrValue: 101, title: "Open ocean" },
        { attrId: 34, attrValue: 102, title: "River" },
        { attrId: 34, attrValue: 103, title: "Salt marsh" }
    ],
    other: { attrId: 34, attrValue: 104, title: "Other" }
};


export const CHARACTERISTICS_TERMS_USED = {
    options: [
        { attrId: 6, attrValue: 57, title: "Artisanal" },
        { attrId: 6, attrValue: 58, title: "Coastal" },
        { attrId: 6, attrValue: 131, title: "Indigenous" },
        { attrId: 6, attrValue: 59, title: "Inland" },
        { attrId: 6, attrValue: 60, title: "Inshore" },
        { attrId: 6, attrValue: 61, title: "Small-boat" },
        { attrId: 6, attrValue: 62, title: "Small-scale" },
        { attrId: 6, attrValue: 63, title: "Subsistence" },
        { attrId: 6, attrValue: 64, title: "Traditional" }
    ],
    other: { attrId: 6, attrValue: 65, title: "Other" }
};


export const CHARACTERISTICS_GEARS = {
    options: [
        { attrId: 35, attrValue: 72, title: "Dredges" },
        { attrId: 35, attrValue: 73, title: "Falling gear (cast nets)" },
        { attrId: 35, attrValue: 74, title: "Gillnets and entangling nets" },
        { attrId: 35, attrValue: 75, title: "Gleaning (collected by hand)" },
        { attrId: 35, attrValue: 76, title: "Grappling and wounding (harpoons)" },
        { attrId: 35, attrValue: 77, title: "Harvesting machines" },
        { attrId: 35, attrValue: 78, title: "Hooks and lines" },
        { attrId: 35, attrValue: 79, title: "Lift nets" },
        { attrId: 35, attrValue: 80, title: "Poisons and explosives" },
        { attrId: 35, attrValue: 81, title: "Recreational fishing gear" },
        { attrId: 35, attrValue: 82, title: "Seine nets" },
        { attrId: 35, attrValue: 83, title: "Surrounding nets" },
        { attrId: 35, attrValue: 84, title: "Traps" },
        { attrId: 35, attrValue: 85, title: "Trawls" }
    ],
    other: { attrId: 35, attrValue: 86, title: "Other" }
};


export const CHARACTERISTICS_MARKET_DISTRIBUTION = {
    options: [
        { attrId: 38, attrValue: 105, title: "Retained for household consumption and given to family/friends" },
        { attrId: 38, attrValue: 106, title: "Sold in local markets" },
        { attrId: 38, attrValue: 107, title: "Sold to outside markets" },
        { attrId: 38, attrValue: 129, title: "Going to non-food uses" }
    ],
    other: { attrId: 38, attrValue: 108, title: "Other" }
};


export const CHARACTERISTICS_GOVERNANCE = {
    options: [
        { attrId: 39, attrValue: 109, title: "Co-management/co-governance" },
        { attrId: 39, attrValue: 110, title: "Community-based management" },
        { attrId: 39, attrValue: 126, title: "Self governance" },
        { attrId: 39, attrValue: 111, title: "Top-down/hierarchical governance" }
    ],
    other: { attrId: 39, attrValue: 112, title: "Other" }
};


export const CHARACTERISTICS_REGULATIONS = {
    options: [
        { attrId: 42, attrValue: 113, title: "License/permit" },
        { attrId: 42, attrValue: 114, title: "Buy-back" },
        { attrId: 42, attrValue: 115, title: "Catch limit" },
        { attrId: 42, attrValue: 116, title: "Seasonal closure" },
        { attrId: 42, attrValue: 128, title: "Area closure" },
        { attrId: 42, attrValue: 127, title: "Gear restriction" },
        { attrId: 42, attrValue: 119, title: "Vessel restriction" },
        { attrId: 42, attrValue: 118, title: "Fishing effort restriction" },
        { attrId: 42, attrValue: 117, title: "Community-based rights systems" },
        { attrId: 42, attrValue: 120, title: "Marine protected areas" },
        { attrId: 42, attrValue: 121, title: "Quota allocation" },
        { attrId: 42, attrValue: 122, title: "Taxes and resource rental charges" },
        { attrId: 42, attrValue: 123, title: "Territorial user rights" },
        { attrId: 42, attrValue: 124, title: "Transferrable quotas" },
    ],
    other: { attrId: 42, attrValue: 125, title: "Other" }
};


export const CHARACTERISTICS_AVG_VESSEL_LENGTH = {
    attrId: 2
};


export const CHARACTERISTICS_ENGINE_SIZE = {
    attrId: 3
};


export const CHARACTERISTICS_CREW_NUMBER = {
    attrId: 29
};


export const CHARACTERISTICS_FISHING_DAY_PER_YEAR = {
    attrId: 4
};


export const CHARACTERISTICS_FISHERS_NUMBER = {
    attrId: 7
};


export const CHARACTERISTICS_FULL_TIME_FISHERS_NUMBER = {
    attrId: 8
};


export const CHARACTERISTICS_WOMEN_PERCENT = {
    attrId: 9
};


export const CHARACTERISTICS_HOUSEHOLD_NUMBER = {
    attrId: 18
};


export const CHARACTERISTICS_HOUSEHOLD_PERCENT = {
    attrId: 19
};


export const CHARACTERISTICS_HOUSEHOLD_INCOME_PERCENT = {
    attrId: 13
};


export const CHARACTERISTICS_WOMEN_POST_HARVEST_PERCENT = {
    attrId: 21
};


export const CHARACTERISTICS_CHILDREN_POST_HARVEST_PERCENT = {
    attrId: 22
};


export const CHARACTERISTICS_GDP = {
    attrId: 14
};


export const DEFINITE_ANS = {
    YES: 'Yes',
    NO: 'No',
    NOT_EXPLICITLY: 'Not explicitly'
};


export const DETAILS_ACCORDIONS_LABELS = {
    WHO: [ 'Basic Information', 'Researcher Information', 'Themes/Issues', 'Species', 'External Links'],
    SOTA: [ 'Basic Information', 'Themes/Issues', 'Characteristics', 'Additional Details', 'Species',  'External Links', 'Contributor\'s Information' ],
    PROFILE: [ 'Basic Information', 'Main Characteristics', 'Species', 'Organizations', 'External Links', 'Sources & Comments', 'Contributor\'s Information' ],
    ORGANIZATION: [ 'Basic Information', 'Themes/Issues', 'External Links', 'Contributor\'s Information' ],
    CASESTUDY: [ 'Basic Information', 'Case Study Description', 'Case Study Solution', 'Contributor\'s Information' ],
    GOVERNANCE: [ 'Basic Information', 'Definition of SSF or Related Terms', 'Legal Framework and Institutional Arrangement', 'Key Principles - Legislation and Policy Documents', 'Specific Provision and Consideration for SSF', 'Interaction and Stakeholders Participation', 'Other Context or Specific Information about SSF', 'About the Team', 'Contributor\'s Information' ],
    BLUEJUSTICE: [ 'Basic Information', 'General Information about SSF', 'Social Justice/Equity Issues', 'Image Information', 'Contributor\'s Information' ],
    GUIDELINES: [ 'Details',  'Contributor\'s Information' ]
};


export const GEOGRAPHIC_TITLE = 'Geographic Scope';


export const GS_OPTIONS = {
    LOCAL: 'Local',
    SUB_NATIONAL: 'Sub-national',
    NATIONAL: 'National',
    REGIONAL: 'Regional',
    GLOBAL: 'Global',
    NOT_SPECIFIC: 'Not specific'
};


export const GS_TYPE = {
    GS_LOCAL: 'gs_local',
    GS_SUBNATION: 'gs_subnation',
    GS_NATIONAL: 'gs_national',
    GS_REGION: 'gs_region',
    GS_NS_GLOBAL: 'gs_global_notspecific'
};


export const GS_LABELS = {
    GS_LOCAL: ['Type', 'Name of Local Area', 'Alternate Name', 'Country for Local Area', 'Local Area Setting'],
    GS_SUBNATION: ['Type', 'Name of Sub-National Area', 'Specify Country for Sub-national Area', 'Sub-national Area Type'],
    GS_NATIONAL: ['Type', 'Country'],
    GS_REGION: ['Type', 'Name of Region', 'Countries'],
    GS_NS_GLOBAL: ['Type']
};


export const GS_LOCAL_AREA_SETTINGS = [
    "Urban",
    "Rural, developed",
    "Rural, less developed",
    "Unspecified"
];


export const GS_SUBNATION_AREA_TYPES = [
    "Canton",
    "Commune",
    "County",
    "Department",
    "District",
    "Province",
    "State",
    "Territory",
    "Unspecified"
];


export const GS_REGIONS = [
    { id: 2, name: 'Africa' },
    { id: 3, name: 'Asia' },
    { id: 4, name: 'Caribbean' },
    { id: 5, name: 'Europe' },
    { id: 6, name: 'Latin America' },
    { id: 7, name: 'North America' },
    { id: 8, name: 'Oceania' }
];


export const GUIDELINES_ACTIVITY_TYPE = [
    "Conference",
    "Journal Article",
    "Meeting",
    "National Plan",
    "Network",
    "Newsletter",
    "Regional Program",
    "Workshop",
    "Research"
];


export const GUIDELINES_ACTIVITY_COVERAGE = [
    "Regional",
    "National",
    "International",
    "Global"
];


export const INITIAL_CONTRIBUTION = 'Initial Contribution';


export const JWT_TOKENS = {
    ACCESS: 'access',
    REFRESH: 'refresh'
}


export const PANEL_CODES = {
    WHO: 'who',
    SOTA: 'sota',
    PROFILE: 'profile',
    ORGANIZATION: 'organization',
    CASESTUDY: 'casestudy',
    // GOVERNANCE: 'governance',
    BLUEJUSTICE: 'bluejustice',
    GUIDELINES: 'guidelines'
};


export const PANEL_VALUES = {
    WHO: "Who's Who in SSF",
    SOTA: "State-of-the-Art in SSF Research",
    PROFILE: "SSF Profile",
    ORGANIZATION: "SSF Organization",
    CASESTUDY: "Case Study",
    // GOVERNANCE: "SSF Governance",
    BLUEJUSTICE: "SSF Blue Justice",
    GUIDELINES: "SSF Guidelines"
};


export const REGISTRATION_ACTIONS = {
    SIGNUP: 'signup',
    LOGIN: 'signin',
    FORGOT_PASSWORD: 'forgot-password',
    FORGOT_USERNAME: 'forgot-username',
    RESEND_VERIFICATION_LINK: 'resend-verification-link',
    RESET_PASSWORD: 'reset-password',
    VERIFY_CODE: 'verify-code'
};


export const SPECIES_LINKS_TYPES = {
    INPUT: 'input',
    SELECT: 'select'
};


export const SOTA_DEMOGRAPHIC_FACTORS = {
    demographics_na: 'Not Applicable',
    demographics_age: 'Age',
    demographics_education: 'Education',
    demographics_ethnicity: 'Ethnicity',
    demographics_gender: 'Gender',
    demographics_health: 'Health',
    demographics_income: 'Income',
    demographics_religion: 'Religion',
    demographics_unspecified: 'Unspecified'
};


export const SOTA_EMPLOYMENT_STATUS = {
    employment_na: 'Not Applicable',
    employment_full_time: 'Full-time',
    employment_part_time: 'Part-time',
    employment_seasonal: 'Seasonal',
    employment_unspecified: 'Unspecified'
};


export const SOTA_FISHERY_STAGE = {
    stage_na: 'Not Applicable',
    stage_pre_harvest: 'Pre-harvest',
    stage_harvest: 'Harvest',
    stage_post_harvest: 'Post-harvest',
    stage_unspecified: 'Unspecified'
};


export const SOTA_PUBLICATION_TYPES = [
    { value: 1, title: 'Book' },
    { value: 2, title: 'Book Chapter' },
    { value: 3, title: 'Conference Proceedings' },
    { value: 4, title: 'Documentary' },
    { value: 5, title: 'Dissertation/Thesis' },
    { value: 6, title: 'Newsletter/Newspaper Article' },
    { value: 7, title: 'Peer-reviewed Paper' },
    { value: 8, title: 'Report' }
];


export const THEME_ECONOMICS = {
    options: [
        { value: 102, title: "Economic Viability/Analysis (inc. non-market)" },
        { value: 103, title: "Financial Viability/Analysis" },
        { value: 105, title: "Market Analysis – Value Addition" },
        { value: 106, title: "Market Analysis – Demand/Supply" },
        { value: 107, title: "Market Analysis – Price" },
        { value: 108, title: "Income Distribution" },
        { value: 109, title: "Employment/Income Generation" },
        { value: 110, title: "Food/Nutrition Security" },
        { value: 111, title: "Globalization / Liberalization / International Trade" },
        { value: 112, title: "Incentives/Subsidies" },
        { value: 113, title: "Institutional/Transaction Cost" }
    ],
    other: {
        value: 145,
        title: "Other"
    }
};


export const THEME_ECOLOGICAL = {
    options: [
        { value: 114, title: 'Environmental condition (inc. climate change)' },
        { value: 115, title: 'Marine protected areas' },
        { value: 116, title: 'Conservation/stewardship' },
        { value: 117, title: 'Biology/population' },
        { value: 118, title: 'Habitat (inc. status, interactions)' },
        { value: 119, title: 'Anthropogenic impacts/threats' },
        { value: 120, title: 'Sustainable/best practices (inc. technology)' },
        { value: 121, title: 'Traditional/local/scientific ecological knowledge' },
        { value: 122, title: 'Ecosystems (inc. services, resilience, etc.)' }
    ],
    other: {
        value: 146,
        title: "Other"
    }
};


export const THEME_SOCIALS = {
    options: [
        { value: 123, title: 'Development, social change, adaptation/coping strategies' },
        { value: 124, title: 'Food systems (inc. sovereignty, subsistence)' },
        { value: 125, title: 'Gender' },
        { value: 126, title: 'Labour mobility/migration' },
        { value: 127, title: 'Wellbeing, poverty and vulnerability (inc. life and/or job satisfaction, health and safety)' },
        { value: 128, title: 'Livelihoods (inc. diversification, dependency, alternatives)' },
        { value: 129, title: 'Intersectoral relations' },
        { value: 130, title: 'Intergenerational transmission of knowledge, recruitment, professionalization, education, training' },
        { value: 131, title: 'Social stratification, power and conflict' },
        { value: 132, title: 'Identity, place and culture (inc. material, belief systems, perception)' },
        { value: 133, title: 'Social relations of production, exchange and consumption' },
        { value: 134, title: 'Fishing practices (inc. technology)' }
    ],
    other: {
        value: 147,
        title: "Other"
    }
};


export const THEME_GOVERNANCE = {
    options: [
        { value: 135, title: 'Access and allocation' },
        { value: 136, title: 'Ownership and rights (inc. human rights)' },
        { value: 137, title: 'Conflict management (inc. legal representation)' },
        { value: 138, title: 'Community-based/co-management systems' },
        { value: 139, title: 'Goals, principles, knowledge and values' },
        { value: 140, title: 'Organizations (government, NGOs, co-ops, private enterprise, etc.)' },
        { value: 141, title: 'Participation/representation in decision-making' },
        { value: 142, title: 'Policy/tools/instruments' },
        { value: 143, title: 'Law/rules, compliance and enforcement (inc. customary)' },
        { value: 144, title: 'Politics and power' }
    ],
    other: {
        value: 148,
        title: "Other"
    }
};


export const ORGANIZATION_CHECKBOX_TYPES = {
    organization_type_union: 'Union/association',
    organization_type_support: 'Support organization',
    organization_type_coop: 'Cooperative/society',
    organization_type_flag: 'Fisheries local action group'
};


export const ORGANIZATION_MOTIVATION = {
    motivation_voice: 'Increase voice/representation in decision-making',
    motivation_market: 'Improve market opportunities',
    motivation_sustainability: 'Enhance sustainability',
    motivation_economics: 'Address economic concerns',
    motivation_rights: 'Promote/uphold SSF rights',
    motivation_collaboration: 'Facilitate collaboration and networking'
};


export const ORGANIZATION_MAIN_ACTIVITIES = {
    activities_capacity: 'Capacity building and knowledge mobilization',
    activities_sustainability: 'Promotion of sustainable practices',
    activities_networking: 'Development of networks/linkages',
    activities_marketing: 'Marketing and business development',
    activities_collaboration: 'Facilitating collaboration with scientists and/or officials'
};


export const ORGANIZATION_NETWORKS = {
    network_types_state: 'State/government agencies',
    network_types_ssfos: 'Small-scale fishery organizations',
    network_types_community: 'Community groups',
    network_types_society: 'Civil society organizations',
    network_types_ngos: 'Non-governmental organizations'
};


export const ORGANIZATION_TYPES = [
    "State/government department",
    "Non government organization",
    "Union/association",
    "Support organization",
    "Fisheries local action group",
    "Market organization",
    "Co-op/society"
]


export const URL_OPTIONS = [
    'URL Link',
    'Image Link',
    'YouTube Video Link'
];


export const WHO_EDUCATION_LEVELS = [
    'Bachelor',
    "Master",
    "PhD"
];


export const RESPONSE_CODES = {
    HTTP_100_CONTINUE: 100,
    HTTP_101_SWITCHING_PROTOCOLS: 101,
    HTTP_200_OK: 200,
    HTTP_201_CREATED: 201,
    HTTP_202_ACCEPTED: 202,
    HTTP_203_NON_AUTHORITATIVE_INFORMATION: 203,
    HTTP_204_NO_CONTENT: 204,
    HTTP_205_RESET_CONTENT: 205,
    HTTP_206_PARTIAL_CONTENT: 206,
    HTTP_207_MULTI_STATUS: 207,
    HTTP_208_ALREADY_REPORTED: 208,
    HTTP_226_IM_USED: 226,
    HTTP_300_MULTIPLE_CHOICES: 300,
    HTTP_301_MOVED_PERMANENTLY: 301,
    HTTP_302_FOUND: 302,
    HTTP_303_SEE_OTHER: 303,
    HTTP_304_NOT_MODIFIED: 304,
    HTTP_305_USE_PROXY: 305,
    HTTP_306_RESERVED: 306,
    HTTP_307_TEMPORARY_REDIRECT: 307,
    HTTP_308_PERMANENT_REDIRECT: 308,
    HTTP_400_BAD_REQUEST: 400,
    HTTP_401_UNAUTHORIZED: 401,
    HTTP_402_PAYMENT_REQUIRED: 402,
    HTTP_403_FORBIDDEN: 403,
    HTTP_404_NOT_FOUND: 404,
    HTTP_405_METHOD_NOT_ALLOWED: 405,
    HTTP_406_NOT_ACCEPTABLE: 406,
    HTTP_407_PROXY_AUTHENTICATION_REQUIRED: 407,
    HTTP_408_REQUEST_TIMEOUT: 408,
    HTTP_409_CONFLICT: 409,
    HTTP_410_GONE: 410,
    HTTP_411_LENGTH_REQUIRED: 411,
    HTTP_412_PRECONDITION_FAILED: 412,
    HTTP_413_REQUEST_ENTITY_TOO_LARGE: 413,
    HTTP_414_REQUEST_URI_TOO_LONG: 414,
    HTTP_415_UNSUPPORTED_MEDIA_TYPE: 415,
    HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    HTTP_417_EXPECTATION_FAILED: 417,
    HTTP_418_IM_A_TEAPOT: 418,
    HTTP_422_UNPROCESSABLE_ENTITY: 422,
    HTTP_423_LOCKED: 423,
    HTTP_424_FAILED_DEPENDENCY: 424,
    HTTP_426_UPGRADE_REQUIRED: 426,
    HTTP_428_PRECONDITION_REQUIRED: 428,
    HTTP_429_TOO_MANY_REQUESTS: 429,
    HTTP_431_REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    HTTP_500_INTERNAL_SERVER_ERROR: 500,
    HTTP_501_NOT_IMPLEMENTED: 501,
    HTTP_502_BAD_GATEWAY: 502,
    HTTP_503_SERVICE_UNAVAILABLE: 503,
    HTTP_504_GATEWAY_TIMEOUT: 504,
    HTTP_505_HTTP_VERSION_NOT_SUPPORTED: 505,
    HTTP_506_VARIANT_ALSO_NEGOTIATES: 506,
    HTTP_507_INSUFFICIENT_STORAGE: 507,
    HTTP_508_LOOP_DETECTED: 508,
    HTTP_509_BANDWIDTH_LIMIT_EXCEEDED: 509,
    HTTP_510_NOT_EXTENDED: 510,
    HTTP_511_NETWORK_AUTHENTICATION_REQUIRED: 511
}


export const RESPONSE_MESSAGE = {
    SUCCESSFUL: 'successful',
    VALIDATION_ERRORS: 'It looks like you haven\'t filled up all the required data properly. Please fill up all the mandatory fields and try again',
    INTERNAL_SERVER_ERROR:  'Sorry, we encountered an unexpected error. Please try again later!!',
    LOGGED_USER_PROFILE_NOT_FOUND: 'Sorry, we encountered an unexpected error. Please try to re-login and try again later!!' ,
    RECORD_CREATED_SUCCESSFULLY: 'Record created successfully!!',
    ERROR_CREATING: "Sorry, we encountered an unexpected error while creating the record. Please try again later!!",
    RECORD_UPDATED_SUCCESSFULLY: 'Record updated successfully!!',
    ERROR_UPDATING: "Sorry, we encountered an unexpected error while updating the record. Please try again later!!",

    ALL_FIELDS_REQUIRED: "All fields are required in the form.",
    SIGN_UP_SUCCESSFULL: "Please check your email to confirm your account.",
    UNKNOWN_ERROR: "Something went wrong. Please try again later. If the issue persists, please contact support.",
    INVALID_PASSWORD_LENGTH: "Password must be at least 8 characters long.",
    PASSWORD_CONFIRMATION_MISMATCH: "Password and confirm password fields don't match.",
    INVALID_CREDENTIALS: "Username or password is wrong.",
    PASSWORD_RESET_INSTRUCTION: "Please check your email for the verification code.",
    USERNAME_INSTRUCTION: "Please check your email for your username.",
    ACTIVATION_LINK_RESENT: "Please check your email for the updated activation link.",
    PASSWORD_RESET_SUCCESSFUL: "Your password was successfully updated. Please login now with your new password.",
    CREDENTIAL_ERRORS: "Your credentials could not matched.",

    ACCOUNT_ACTIVATED: "Congratulations!! Your account has been activated. Please login to continue.",
    ACCOUNT_ALREADY_ACTIVATED: "Looks like your account is already activated. Please proceed to login.",
    ACTIVATION_TOKEN_EXPIRED: "Looks like your activation link has been expired. Click below to get a new activation link",
    CANNOT_ACTIVATE: "Something went wrong. If you have already activated your account, please proceed to login. If you have signed up but have not activated yet, then your activation link might have been expired. Click below to get a new activation link",
    ACCOUNT_IS_NOT_ACTIVE: "The account is not activated yet. Please activate your account first. The activation link should have been sent to you when you signed up. If the previous link is lost or expired, please click on the link below to get another verification link",
    EMAIL_ALREADY_EXISTS: "An account already exists with the email address you have provided.",
    EMAIL_DOESNT_EXIST: "No account matched with the email address you have provided. If you don't have an account, please sign up first.",
    USERNAME_ALREADY_EXISTS: "The username you have provided is already taken by someone else. Please choose a new one.",
    USERNAME_DOESNT_EXIST: "No account matched with the given username. If you don't have an account, please sign up first.",
    PASSWORD_EXPIRED: "Your password might have been expired. Please reset password by using the 'Reset Password' option and then try again.",
    PASSWORD_VERIFICATION_CODE_MATCHED: "Verification code matched. Please provide the new password.",
    PASSWORD_VERIFICATION_CODE_MISMATCHED: "The verification code did not match or might have been expired. Please start over to get a new verification code. In case you tried multiple times, please make sure to provide the code from the latest e-mail."
};


export const PANELS_LIST = [
    { code: PANEL_CODES.WHO, label: PANEL_VALUES.WHO, icon:'/assets/img/icons/panels/icon-who.png' },
    { code: PANEL_CODES.SOTA, label: PANEL_VALUES.SOTA, icon:'/assets/img/icons/panels/icon-sota.png' },
    { code: PANEL_CODES.PROFILE, label: PANEL_VALUES.PROFILE, icon:'/assets/img/icons/panels/icon-profile.png' },
    { code: PANEL_CODES.ORGANIZATION, label: PANEL_VALUES.ORGANIZATION, icon:'/assets/img/icons/panels/icon-organization.png' },
    { code: PANEL_CODES.CASESTUDY, label: PANEL_VALUES.CASESTUDY, icon:'/assets/img/icons/panels/icon-case.png' },
    { code: PANEL_CODES.GOVERNANCE, label: PANEL_VALUES.GOVERNANCE, icon:'/assets/img/icons/panels/icon-governance.png' },
    { code: PANEL_CODES.BLUEJUSTICE, label: PANEL_VALUES.BLUEJUSTICE, icon:'/assets/img/icons/panels/icon-bluejustice.png' },
    { code: PANEL_CODES.GUIDELINES, label: PANEL_VALUES.GUIDELINES, icon:'/assets/img/icons/panels/icon-guidelines.png' }
];


export const THEME_ISSUES_CATEGORIES = {
    ECONOMIC: 'Economic',
    ECOLOGICAL: 'Ecological',
    SOCIAL: 'Social/Cultural',
    GOVERNANCE: 'Governance'
}


export const KEEP_BLUEJUSTICE_IMAGE_KEY = 'keep-image';
export const REMOVE_BLUEJUSTICE_IMAGE_KEY = 'remove-image';
export const UPLOAD_BLUEJUSTICE_IMAGE_KEY = 'upload-image';


export const COUNTRIES_LIST = [
    { id: 165, name: "Afghanistan", coordinates: [ 66, 33 ] },
    { id: 166, name: "Albania", coordinates: [ 20, 41 ] },
    { id: 167, name: "Algeria", coordinates: [ 3, 28 ] },
    { id: 168, name: "Andorra", coordinates: [ 1.5, 42.5 ] },
    { id: 169, name: "Angola", coordinates: [ 18.5, -12.5 ] },
    { id: 170, name: "Antigua and Barbuda", coordinates: [ -61.8, 17.05 ] },
    { id: 171, name: "Argentina", coordinates: [ -64, -34 ] },
    { id: 172, name: "Armenia", coordinates: [ 45, 40 ] },
    { id: 173, name: "Australia", coordinates: [ 135, -25 ] },
    { id: 174, name: "Austria", coordinates: [ 13.333333, 47.333333 ] },
    { id: 175, name: "Azerbaijan", coordinates: [ 47.5, 40.5 ] },
    { id: 176, name: "Bahamas", coordinates: [ -76, 24 ] },
    { id: 177, name: "Bahrain", coordinates: [ 50.5, 26 ] },
    { id: 178, name: "Bangladesh", coordinates: [ 90, 24 ] },
    { id: 179, name: "Barbados", coordinates: [ -59.533333, 13.166667 ] },
    { id: 180, name: "Belarus", coordinates: [ 28, 53 ] },
    { id: 181, name: "Belgium", coordinates: [ 4, 50.833333 ] },
    { id: 182, name: "Belize", coordinates: [ -88.75, 17.25 ] },
    { id: 183, name: "Benin", coordinates: [ 2.25, 9.5 ] },
    { id: 184, name: "Bhutan", coordinates: [ 90.5, 27.5 ] },
    { id: 185, name: "Bolivia (Plurinational State of)", coordinates: [ -65, -17 ] },
    { id: 186, name: "Bosnia and Herzegovina", coordinates: [ 17.833333, 44.25 ] },
    { id: 187, name: "Botswana", coordinates: [ 24, -22 ] },
    { id: 188, name: "Brazil", coordinates: [ -55, -10 ] },
    { id: 189, name: "Brunei Darussalam", coordinates: [ 114.666667, 4.5 ] },
    { id: 190, name: "Bulgaria", coordinates: [ 25, 43 ] },
    { id: 191, name: "Burkina Faso", coordinates: [ -2, 13 ] },
    { id: 192, name: "Burundi", coordinates: [ 30, -3.5 ] },
    { id: 193, name: "Cambodia", coordinates: [ 105, 13 ] },
    { id: 194, name: "Cameroon", coordinates: [ 12, 6 ] },
    { id: 195, name: "Canada", coordinates: [ -96, 60 ] },
    { id: 196, name: "Cabo Verde", coordinates: [ -24, 16 ] },
    { id: 197, name: "Central African Republic", coordinates: [ 21, 7 ] },
    { id: 198, name: "Chad", coordinates: [ 19, 15 ] },
    { id: 199, name: "Chile", coordinates: [ -71, -30 ] },
    { id: 200, name: "China", coordinates: [ 105, 35 ] },
    { id: 201, name: "Colombia", coordinates: [ -72, 4 ] },
    { id: 202, name: "Comoros", coordinates: [ 44.25, -12.166667 ] },
    { id: 203, name: "Congo", coordinates: [ 15, -1 ] },
    { id: 204, name: "Cook Islands", coordinates: [ -161.583333, -16.083333 ] },
    { id: 205, name: "Costa Rica", coordinates: [ -84, 10 ] },
    { id: 206, name: "Cote d'Ivoire", coordinates: [ -5, 8 ] },
    { id: 207, name: "Croatia", coordinates: [ 15.5, 45.166667 ] },
    { id: 208, name: "Cuba", coordinates: [ -79.5, 22 ] },
    { id: 209, name: "Cyprus", coordinates: [ 33, 35 ] },
    { id: 210, name: "Czech Republic", coordinates: [ 15, 49.75 ] },
    { id: 211, name: "Democratic People's Republic of Korea", coordinates: [ 127, 40 ] },
    { id: 212, name: "Denmark", coordinates: [ 10, 56 ] },
    { id: 213, name: "Democratic Republic of the Congo", coordinates: [ 25, 0 ] },
    { id: 214, name: "Djibouti", coordinates: [ 42.5, 11.5 ] },
    { id: 215, name: "Dominica", coordinates: [ -61.333333, 15.5 ] },
    { id: 216, name: "Dominican Republic", coordinates: [ -70.666667, 19 ] },
    { id: 217, name: "Ecuador", coordinates: [ -77.5, -2 ] },
    { id: 218, name: "Egypt", coordinates: [ 30, 27 ] },
    { id: 219, name: "El Salvador", coordinates: [ -88.916667, 13.833333 ] },
    { id: 220, name: "Equatorial Guinea", coordinates: [ 10, 2 ] },
    { id: 221, name: "Eritrea", coordinates: [ 39, 15 ] },
    { id: 222, name: "Estonia", coordinates: [ 26, 59 ] },
    { id: 223, name: "Ethiopia", coordinates: [ 38, 8 ] },
    { id: 224, name: "Fiji", coordinates: [ 178, -18 ] },
    { id: 225, name: "Finland", coordinates: [ 26, 64 ] },
    { id: 226, name: "France", coordinates: [ 2, 46 ] },
    { id: 227, name: "Gabon", coordinates: [ 11.75, -1 ] },
    { id: 228, name: "Gambia", coordinates: [ -15.5, 13.5 ] },
    { id: 229, name: "Georgia", coordinates: [ 43.499905, 41.999981 ] },
    { id: 230, name: "Germany", coordinates: [ 10.5, 51.5 ] },
    { id: 231, name: "Ghana", coordinates: [ -2, 8 ] },
    { id: 232, name: "Greece", coordinates: [ 22, 39 ] },
    { id: 233, name: "Grenada", coordinates: [ -61.666667, 12.116667 ] },
    { id: 234, name: "Guatemala", coordinates: [ -90.25, 15.5 ] },
    { id: 235, name: "Guinea", coordinates: [ -10, 11 ] },
    { id: 236, name: "Guinea-Bissau", coordinates: [ -15, 12 ] },
    { id: 237, name: "Guyana", coordinates: [ -59, 5 ] },
    { id: 238, name: "Haiti", coordinates: [ -72.416667, 19 ] },
    { id: 239, name: "Honduras", coordinates: [ -86.5, 15 ] },
    { id: 240, name: "Hungary", coordinates: [ 20, 47 ] },
    { id: 241, name: "Iceland", coordinates: [ -18, 65 ] },
    { id: 242, name: "India", coordinates: [ 77, 20 ] },
    { id: 243, name: "Indonesia", coordinates: [ 120, -5 ] },
    { id: 244, name: "Iran (Islamic Republic of)", coordinates: [ 53, 32 ] },
    { id: 245, name: "Iraq", coordinates: [ 44, 33 ] },
    { id: 246, name: "Ireland", coordinates: [ -8, 53 ] },
    { id: 247, name: "Israel", coordinates: [ 34.75, 31.5 ] },
    { id: 248, name: "Italy", coordinates: [ 12.833333, 42.833333 ] },
    { id: 249, name: "Jamaica", coordinates: [ -77.5, 18.25 ] },
    { id: 250, name: "Japan", coordinates: [ 138, 36 ] },
    { id: 251, name: "Jordan", coordinates: [ 36, 31 ] },
    { id: 252, name: "Kazakhstan", coordinates: [ 68, 48 ] },
    { id: 253, name: "Kenya", coordinates: [ 38, 1 ] },
    { id: 254, name: "Kiribati", coordinates: [ -170, -5 ] },
    { id: 255, name: "Kuwait", coordinates: [ 47.75, 29.5 ] },
    { id: 256, name: "Kyrgyzstan", coordinates: [ 75, 41 ] },
    { id: 257, name: "Lao People's Democratic Republic", coordinates: [ 105, 18 ] },
    { id: 258, name: "Latvia", coordinates: [ 25, 57 ] },
    { id: 259, name: "Lebanon", coordinates: [ 35.833333, 33.833333 ] },
    { id: 260, name: "Lesotho", coordinates: [ 28.25, -29.5 ] },
    { id: 261, name: "Liberia", coordinates: [ -9.5, 6.5 ] },
    { id: 262, name: "Libya", coordinates: [ 17, 25 ] },
    { id: 263, name: "Lithuania", coordinates: [ 24, 56 ] },
    { id: 264, name: "Luxembourg", coordinates: [ 6.166667, 49.75 ] },
    { id: 265, name: "Madagascar", coordinates: [ 47, -20 ] },
    { id: 266, name: "Malaysia", coordinates: [ 112.5, 2.5 ] },
    { id: 267, name: "Maldives", coordinates: [ 73, 3.2 ] },
    { id: 268, name: "Malta", coordinates: [ 14.433333, 35.916667 ] },
    { id: 269, name: "Marshall Islands", coordinates: [ 167, 10 ] },
    { id: 270, name: "Malawi", coordinates: [ 34, -13.5 ] },
    { id: 271, name: "Mauritania", coordinates: [ -12, 20 ] },
    { id: 272, name: "Mali", coordinates: [ -4, 17 ] },
    { id: 273, name: "Mauritius", coordinates: [ 57.583333, -20.3 ] },
    { id: 274, name: "Mexico", coordinates: [ -102, 23 ] },
    { id: 275, name: "Micronesia (Federated States of)", coordinates: [ 152, 5 ] },
    { id: 276, name: "Monaco", coordinates: [ 7.4, 43.733333 ] },
    { id: 277, name: "Mongolia", coordinates: [ 105, 46 ] },
    { id: 278, name: "Montenegro", coordinates: [ 19.3, 42.5 ] },
    { id: 279, name: "Morocco", coordinates: [ -5, 32 ] },
    { id: 280, name: "Mozambique", coordinates: [ 35, -18.25 ] },
    { id: 281, name: "Myanmar", coordinates: [ 98, 22 ] },
    { id: 282, name: "Namibia", coordinates: [ 17, -22 ] },
    { id: 283, name: "Nauru", coordinates: [ 166.916667, -0.533333 ] },
    { id: 284, name: "Nepal", coordinates: [ 84, 28 ] },
    { id: 285, name: "Netherlands", coordinates: [ 5.75, 52.5 ] },
    { id: 286, name: "New Zealand", coordinates: [ 174, -42 ] },
    { id: 287, name: "Nicaragua", coordinates: [ -85, 13 ] },
    { id: 288, name: "Niger", coordinates: [ 8, 16 ] },
    { id: 289, name: "Nigeria", coordinates: [ 8, 10 ] },
    { id: 290, name: "Niue", coordinates: [ -169.866667, -19.033333 ] },
    { id: 291, name: "Norway", coordinates: [ 10, 62 ] },
    { id: 292, name: "Oman", coordinates: [ 57, 21 ] },
    { id: 293, name: "Pakistan", coordinates: [ 70, 30 ] },
    { id: 294, name: "Palau", coordinates: [ 134, 6 ] },
    { id: 295, name: "Panama", coordinates: [ -80, 9 ] },
    { id: 296, name: "Papua New Guinea", coordinates: [ 147, -6 ] },
    { id: 297, name: "Paraguay", coordinates: [ -57.996389, -22.993333 ] },
    { id: 298, name: "Peru", coordinates: [ -76, -10 ] },
    { id: 299, name: "Philippines", coordinates: [ 122, 13 ] },
    { id: 300, name: "Poland", coordinates: [ 20, 52 ] },
    { id: 301, name: "Portugal", coordinates: [ -8, 39.5 ] },
    { id: 302, name: "Qatar", coordinates: [ 51.25, 25.5 ] },
    { id: 303, name: "Republic of Korea", coordinates: [ 127.5, 37 ] },
    { id: 304, name: "Republic of Moldova", coordinates: [ 29, 47 ] },
    { id: 305, name: "Romania", coordinates: [ 25, 46 ] },
    { id: 306, name: "Russian Federation", coordinates: [ 100, 60 ] },
    { id: 307, name: "Rwanda", coordinates: [ 30, -2 ] },
    { id: 308, name: "Saint Kitts and Nevis", coordinates: [ -62.75, 17.333333 ] },
    { id: 309, name: "Saint Lucia", coordinates: [ -60.966667, 13.883333 ] },
    { id: 310, name: "Saint Vincent and the Grenadines", coordinates: [ -61.2, 13.083333 ] },
    { id: 311, name: "Samoa", coordinates: [ -172.178309, -13.803096 ] },
    { id: 312, name: "San Marino", coordinates: [ 12.416667, 43.933333 ] },
    { id: 313, name: "Sao Tome and Principe", coordinates: [ 7, 1 ] },
    { id: 314, name: "Saudi Arabia", coordinates: [ 45, 25 ] },
    { id: 315, name: "Senegal", coordinates: [ -14, 14 ] },
    { id: 316, name: "Serbia", coordinates: [ 21, 44 ] },
    { id: 317, name: "Seychelles", coordinates: [ 55.666667, -4.583333 ] },
    { id: 318, name: "Sierra Leone", coordinates: [ -11.5, 8.5 ] },
    { id: 319, name: "Singapore", coordinates: [ 103.8, 1.366667 ] },
    { id: 320, name: "Slovakia", coordinates: [ 19.5, 48.666667 ] },
    { id: 321, name: "Slovenia", coordinates: [ 15.166667, 46.25 ] },
    { id: 322, name: "Solomon Islands", coordinates: [ 159, -8 ] },
    { id: 323, name: "Somalia", coordinates: [ 48, 6 ] },
    { id: 324, name: "South Africa", coordinates: [ 26, -30 ] },
    { id: 325, name: "South Sudan", coordinates: [ 30, 8 ] },
    { id: 326, name: "Spain", coordinates: [ -4, 40 ] },
    { id: 327, name: "Sri Lanka", coordinates: [ 81, 7 ] },
    { id: 328, name: "Sudan", coordinates: [ 30, 16 ] },
    { id: 329, name: "Suriname", coordinates: [ -56, 4 ] },
    { id: 330, name: "Swaziland", coordinates: [ 31.5, -26.5 ] },
    { id: 331, name: "Sweden", coordinates: [ 15, 62 ] },
    { id: 332, name: "Switzerland", coordinates: [ 8, 47 ] },
    { id: 333, name: "Syrian Arab Republic", coordinates: [ 38, 35 ] },
    { id: 334, name: "Tajikistan", coordinates: [ 71, 39 ] },
    { id: 335, name: "Thailand", coordinates: [ 100, 15 ] },
    { id: 336, name: "The former Yugoslav Republic of Macedonia", coordinates: [ 22, 41.833333 ] },
    { id: 337, name: "Timor-Leste", coordinates: [ 125.75, -8.833333 ] },
    { id: 338, name: "Togo", coordinates: [ 1.166667, 8 ] },
    { id: 339, name: "Tonga", coordinates: [ -175, -20 ] },
    { id: 340, name: "Trinidad and Tobago", coordinates: [ -61, 11 ] },
    { id: 341, name: "Tunisia", coordinates: [ 9, 34 ] },
    { id: 342, name: "Turkey", coordinates: [ 34.911546, 39.059012 ] },
    { id: 343, name: "Turkmenistan", coordinates: [ 60, 40 ] },
    { id: 344, name: "Tuvalu", coordinates: [ 178, -8 ] },
    { id: 345, name: "Uganda", coordinates: [ 33, 2 ] },
    { id: 346, name: "Ukraine", coordinates: [ 32, 49 ] },
    { id: 347, name: "United Arab Emirates", coordinates: [ 54, 24 ] },
    { id: 348, name: "United Kingdom", coordinates: [ -4, 54 ] },
    { id: 349, name: "United Republic of Tanzania", coordinates: [ 35, -6 ] },
    { id: 350, name: "United States of America", coordinates: [ -98.5795, 39.828175 ] },
    { id: 351, name: "Uruguay", coordinates: [ -56, -33 ] },
    { id: 352, name: "Uzbekistan", coordinates: [ 63.84911, 41.707542 ] },
    { id: 353, name: "Vanuatu", coordinates: [ 167, -16 ] },
    { id: 354, name: "Venezuela (Bolivarian Republic of)", coordinates: [ -66, 8 ] },
    { id: 355, name: "Viet Nam", coordinates: [ 107.833333, 16.166667 ] },
    { id: 356, name: "Yemen", coordinates: [ 47.5, 15.5 ] },
    { id: 357, name: "Zambia", coordinates: [ 30, -15 ] },
    { id: 358, name: "Zimbabwe", coordinates: [ 29, -19 ] },
    { id: 359, name: "Puerto Rico", coordinates: [ -66.4998941, 18.2482882 ] },
    { id: 360, name: "Anguilla", coordinates: [ -63.05, 18.216667 ] },
    { id: 361, name: "Virgin Islands (British)", coordinates: [ -64.5, 18.5 ] },
    { id: 362, name: "Montserrat", coordinates: [ -62.2, 16.75 ] },
    { id: 363, name: "Turks and Caicos Islands", coordinates: [ -71.583333, 21.733333 ] },
    { id: 364, name: "French Guiana", coordinates: [ 144.7366667, 13.4444444 ] },
    { id: 365, name: "Virgin Islands (U.S.)", coordinates: [ 167, -16 ] },
    { id: 366, name: "U.S. Minor Islands", coordinates: [ 166.65, 19.28 ] },
    { id: 367, name: "Martinique", coordinates: [ -61, 14.666667 ] },
    { id: 368, name: "Netherlands Antilles", coordinates: [ -68.3, 12.2 ] },
    { id: 369, name: "Guadeloupe", coordinates: [ -61.583333, 16.25 ] },
    { id: 370, name: "Faroe Islands", coordinates: [ -7, 62 ] },
    { id: 371, name: "Greenland", coordinates: [ -40, 72 ] },
    { id: 372, name: "Northern Mariana Islands", coordinates: [ 146, 16 ] },
    { id: 373, name: "Cape Verde", coordinates: [ -24, 16 ] },
    { id: 374, name: "New Caledonia", coordinates: [ 165.5, -21.5 ] },
    { id: 375, name: "Taiwan, Province of China", coordinates: [ -71.583333, 21.733333 ] },
    { id: 376, name: "Hong Kong", coordinates: [ 114.166667, 22.25 ] }
];
