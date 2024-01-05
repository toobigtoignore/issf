import { getSearchResultsUrl } from '../constants/api';


export const get = async (url: string) => {
    try{
        const response = await fetch(url);
        const responseData = await response.json();
        return responseData;
    } catch(e){
        return false;
    }
}


export const getSearchResults = async(
    title: string,
    panels: string,
    contributor_ids: string,
    countries: string,
    startYear: string,
    endYear: string
) => {
    if(title == "") title = "null";
    if(panels == "") panels = "null";
    if(contributor_ids == "") contributor_ids = "null";
    if(countries == "") countries = "null";
    if(startYear == "") startYear = "null";
    if(endYear == "") endYear = "null";
    const searchUrl = getSearchResultsUrl(title,panels,contributor_ids,countries,startYear,endYear);
    const searchResults = await get(searchUrl);
    return searchResults;
}
