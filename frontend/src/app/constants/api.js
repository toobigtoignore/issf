import { environment } from '../../environments/environment';


const baseurl = environment.API_URL;


// AUTHORIZATION API
export const changePasswordUrl = `${baseurl}/authentication/change-password`;
export const checkLoginStatusUrl = (userId, jti) => `${baseurl}/authentication/login-status/${userId}/${jti}`;
export const forgotPasswordUrl = `${baseurl}/authentication/forgot-password/`;
export const forgotUsernameUrl = `${baseurl}/authentication/get-username/`;
export const loginUrl = `${baseurl}/authentication/login`;
export const logoutUrl = `${baseurl}/user/logout`;
export const refreshTokenUrl = `${baseurl}/user/token/refresh`;
export const resendActivationLinkUrl = `${baseurl}/authentication/resend-activation-link/`;
export const resetPasswordUrl = `${baseurl}/authentication/reset-password`;
export const signupUrl = `${baseurl}/authentication/signup`;


// ISSF BASE API
export const deleteRecordUrl = recordId => `${baseurl}/issf-base/delete/${recordId}`;
export const getAllContributionsUrl = `${baseurl}/issf-base/get-all-contributions`;
export const getAllContributorsUrl = `${baseurl}/issf-base/get-all-contributors`;
export const getAllCountriesUrl = `${baseurl}/issf-base/get-all-countries`;
export const getUsersWithoutPersonProfile = `${baseurl}/issf-base/get-users-without-person-profile`;
export const getContributionsByUserIdUrl = userId => `${baseurl}/issf-base/get-users-contributions/${userId}`;
export const getCountryNameFromId = country_id => `${baseurl}/issf-base/get-country-name-from-id/${country_id}`;
export const getLanguagesUrl = `${baseurl}/issf-base/get-all-languages`;
export const getPersonLinkForUserUrl = userId => `${baseurl}/issf-base/get-person-link-for-user/${userId}`;
export const getRecentContributionsUrl = `${baseurl}/issf-base/get-recent-contributions`;
export const getRecordsByCountryUrl = `${baseurl}/issf-base/get-records-by-country`;
export const getSearchResultsUrl = (title, panels, contributor_ids, countries, startYear, endYear) => `${baseurl}/issf-base/search/${title}/${panels}/${contributor_ids}/${countries}/${startYear}/${endYear}`;
export const getUserUrl = userId => `${baseurl}/issf-base/get-user/${userId}`;
export const getAllOrganizationsUrl = `${baseurl}/issf-base/get-all-organizations`;
export const getLatestRecordUrl = `${baseurl}/issf_base/getLatestRecord`;


// GET RECORD DETAILS URL
export const getPersonRecordUrl = recordId => `${baseurl}/details/person/${recordId}`;
export const getSotaRecordUrl = recordId => `${baseurl}/details/sota/${recordId}`;
export const getProfileRecordUrl = recordId => `${baseurl}/details/profile/${recordId}`;
export const getOrganizationRecordUrl = recordId => `${baseurl}/details/organization/${recordId}`;
export const getCasestudyRecordUrl = recordId => `${baseurl}/details/casestudy/${recordId}`;
export const getGovernanceRecordUrl = recordId => `${baseurl}/details/governance/${recordId}`;
export const getBluejusticeRecordUrl = recordId => `${baseurl}/details/bluejustice/${recordId}`;
export const getGuidelinesRecordUrl = recordId => `${baseurl}/details/guidelines/${recordId}`;


// CREATE RECORD API
export const createPersonRecordUrl = `${baseurl}/person/create`;
export const createSotaRecordUrl = `${baseurl}/sota/create`;
export const createProfileRecordUrl = `${baseurl}/profile/create`;
export const createOrganizationRecordUrl = `${baseurl}/organization/create`;
export const createCasestudyRecordUrl = `${baseurl}/casestudy/create`;
export const createGovernanceRecordUrl = `${baseurl}/governance/create`;
export const createBluejusticeRecordUrl = `${baseurl}/bluejustice/create`;
export const createGuidelinesRecordUrl = `${baseurl}/guidelines/create`;


// UPDATE RECORD API
export const updateCharacteristicsUrl = recordId =>`${baseurl}/issf-base/update/characteristics/${recordId}`;
export const updateGeoscopeUrl = recordId =>`${baseurl}/issf-base/update/geo-scope/${recordId}`;
export const updateSpeciesUrl = recordId =>`${baseurl}/issf-base/update/species/${recordId}`;
export const updateThemeUrl = recordId =>`${baseurl}/issf-base/update/theme-issues/${recordId}`;
export const updateExternalLinksUrl = recordId =>`${baseurl}/issf-base/update/external-links/${recordId}`;
export const updateOrganizationUrl = recordId =>`${baseurl}/organization/update/details/${recordId}`;
export const updateUserUrl = `${baseurl}/user/update`;

export const updateWhoBasicUrl = recordId =>`${baseurl}/who/update/basic/${recordId}`;
export const updateWhoResearcherUrl = recordId =>`${baseurl}/who/update/researcher/${recordId}`;

export const updateSotaBasicUrl = recordId =>`${baseurl}/sota/update/basic/${recordId}`;
export const updateSotaAdditionalUrl = recordId =>`${baseurl}/sota/update/additional-details/${recordId}`;

export const updateProfileBasicUrl = recordId =>`${baseurl}/profile/update/details/${recordId}`;
export const updateProfileOrganizationUrl = recordId =>`${baseurl}/profile/update/organizations/${recordId}`;
export const updateProfileSourcesCommentsUrl = recordId =>`${baseurl}/profile/update/sources/${recordId}`;
export const updateProfilePercentage = recordId =>`${baseurl}/profile/update/percent-completed/${recordId}`;

export const updateCaseStudiesBasicUrl = recordId =>`${baseurl}/casestudy/update/basic/${recordId}`;
export const updateCaseStudiesDescriptionUrl = recordId =>`${baseurl}/casestudy/update/description/${recordId}`;
export const updateCaseStudiesSolutionUrl = recordId =>`${baseurl}/casestudy/update/solution/${recordId}`;

export const updateBluejusticeBasicUrl = recordId =>`${baseurl}/bluejustice/update/basic/${recordId}`;
export const updateBluejusticeFilesUrl = recordId =>`${baseurl}/bluejustice/update/files-info/${recordId}`;
export const updateBluejusticeGeneralInfoUrl = recordId =>`${baseurl}/bluejustice/update/general-info/${recordId}`;
export const updateBluejusticeSocialIssuesUrl = recordId =>`${baseurl}/bluejustice/update/social-issues/${recordId}`;

export const updateGuidelinesRecordUrl = recordId =>`${baseurl}/guidelines/update/${recordId}`;


// ISSF VISUALIZATIONS API
export const getBluejusticeVisualizationUrl =`${baseurl}/visualizations/bluejustice/`;
export const getGearVisualizationUrl =`${baseurl}/visualizations/gear_vessel/`;
export const getGovernanceVisualizationUrl =`${baseurl}/visualizations/governance/`;
export const getSotaVisualizationUrl =`${baseurl}/visualizations/sota/`;
export const getMarketShareVisualizationUrl =`${baseurl}/visualizations/mshare/`;
export const getResearchVisualizationUrl =`${baseurl}/visualizations/researcher/`;
export const getWiwVisualizationUrl =`${baseurl}/visualizations/wiw/`;
