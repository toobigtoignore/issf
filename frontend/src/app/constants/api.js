import { environment } from '../../environments/environment';


const baseurl = environment.API_URL;


// AUTHORIZATION API
export const checkLoginStatusUrl = (userId, jti) => `${baseurl}/authentication/login-status/${userId}/${jti}`;
export const forgotPasswordUrl = `${baseurl}/authentication/forgot-password/`;
export const forgotUsernameUrl = `${baseurl}/authentication/get-username/`;
export const loginUrl = `${baseurl}/authentication/login`;
export const resendActivationLinkUrl = `${baseurl}/authentication/resend-activation-link/`;
export const resetPasswordUrl = `${baseurl}/authentication/reset-password`;
export const signupUrl = `${baseurl}/authentication/signup`;

export const logoutUrl = `${baseurl}/user/logout`;
export const usernameEmailValidityUrl = (username, email) => `${baseurl}/user/doesUserExist/${username}/${email}`;
export const changePasswordUrl = `${baseurl}/auth/users/set_password/`;
export const refreshTokenUrl = `${baseurl}/user/token/refresh`;


// ISSF BASE API
export const deleteRecordUrl = recordId => `${baseurl}/issf-base/delete/${recordId}`;
export const getAllContributionsUrl = `${baseurl}/issf-base/get-all-contributions`;
export const getAllContributorsUrl = `${baseurl}/issf-base/get-all-contributors`;
export const getAllCountriesUrl = `${baseurl}/issf-base/get-all-countries`;
export const getContributionsByUserIdUrl = userId => `${baseurl}/issf-base/get-users-contributions/${userId}`;
export const getCountryNameFromId = country_id => `${baseurl}/issf-base/get-country-name-from-id/${country_id}`;
export const getRecentContributionsUrl = `${baseurl}/issf-base/get-recent-contributions`;
export const getPersonLinkForUserUrl = userId => `${baseurl}/issf-base/get-person-link-for-user/${userId}`;
export const getRecordsByCountryUrl = `${baseurl}/issf-base/get-records-by-country`;
export const getSearchResultsUrl = (title, panels, contributor_ids, countries, startYear, endYear) => `${baseurl}/issf-base/search/${title}/${panels}/${contributor_ids}/${countries}/${startYear}/${endYear}`;
export const getUserUrl = userId => `${baseurl}/issf-base/get-user/${userId}`;


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


export const getLanguagesUrl = `${baseurl}/issf_base/getLanguages`;
export const getLatestRecordUrl = `${baseurl}/issf_base/getLatestRecord`;
export const getAllOrganizationNamesUrl = `${baseurl}/organization/getNames`;


// UPDATE RECORD API
export const updateUserUrl = `${baseurl}/user/update`;

export const updateCharacteristicsUrl = recordId =>`${baseurl}/issf_base/update/characteristics/${recordId}`;
export const updateGeoscopeUrl = recordId =>`${baseurl}/issf_base/update/geoScope/${recordId}`;
export const updateSpeciesUrl = recordId =>`${baseurl}/issf_base/update/species/${recordId}`;
export const updateThemeUrl = recordId =>`${baseurl}/issf_base/update/themeIssue/${recordId}`;
export const updateExternalLinksUrl = recordId =>`${baseurl}/issf_base/update/externalLink/${recordId}`;

export const updateWhoBasicUrl = recordId =>`${baseurl}/who/update/details/${recordId}`;
export const updateWhoResearcherUrl = recordId =>`${baseurl}/who/update/researcher/${recordId}`;

export const updateSotaBasicUrl = recordId =>`${baseurl}/sota/update/basic/${recordId}`;
export const updateSotaAdditionalUrl = recordId =>`${baseurl}/sota/update/additionalDetails/${recordId}`;

export const updateProfileBasicUrl = recordId =>`${baseurl}/profile/update/details/${recordId}`;
export const updateProfileOrganizationUrl = recordId =>`${baseurl}/profile/update/organizations/${recordId}`;
export const updateProfileSourcesCommentsUrl = recordId =>`${baseurl}/profile/update/sources/${recordId}`;
export const updateProfilePercentage = recordId =>`${baseurl}/profile/update/percent-completed/${recordId}`;

export const updateOrganizationUrl = recordId =>`${baseurl}/organization/update/details/${recordId}`;

export const updateCaseStudiesBasicUrl = recordId =>`${baseurl}/casestudy/update/basic/${recordId}`;
export const updateCaseStudiesDescriptionUrl = recordId =>`${baseurl}/casestudy/update/description/${recordId}`;
export const updateCaseStudiesSolutionUrl = recordId =>`${baseurl}/casestudy/update/solution/${recordId}`;

export const updateBluejusticeBasicUrl = recordId =>`${baseurl}/bluejustice/update/basic/${recordId}`;
export const updateBluejusticeContributorUrl = recordId =>`${baseurl}/bluejustice/update/contributor/${recordId}`;
export const updateBluejusticeFilesUrl = recordId =>`${baseurl}/bluejustice/update/filesInfo/${recordId}`;
export const updateBluejusticeGeneralInfoUrl = recordId =>`${baseurl}/bluejustice/update/generalInfo/${recordId}`;
export const updateBluejusticeSocialIssuesUrl = recordId =>`${baseurl}/bluejustice/update/socialIssues/${recordId}`;

// new apis
export const updateGuidelinesRecordUrl = recordId =>`${baseurl}/guidelines/update/${recordId}`;
