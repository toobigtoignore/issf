import { GS_OPTIONS } from '../constants/constants';
import { getCountryNameFromCode, getGeoScopeLabel, getPanelIconFromCode } from './helpers';
import { getGeoScopeDetailsInfo } from '../../assets/js/types';
declare const L;


export const getGeographicInfo = (geoScopeParams: getGeoScopeDetailsInfo, geoScopeType: string) => {
    let geoScopeValues: string[] = [];
    let geoScopeDetailsLabels: string[] = [];
    const { data, activeBlock } = geoScopeParams;

    if(geoScopeType === GS_OPTIONS.LOCAL){
        const blockData = data[activeBlock];
        const coordinates = blockData.area_point?.coordinates;
        geoScopeDetailsLabels = data.map((scopeInfo: any) => scopeInfo.area_name);
        geoScopeValues = [
            geoScopeType,
            blockData?.area_name,
            blockData?.alternate_name,
            blockData?.country?.short_name,
            !blockData?.setting_other || blockData?.setting_other === '' ? blockData?.setting : blockData?.setting_other
        ];

        if(coordinates?.length > 0) getAndSetLatLong(coordinates, geoScopeParams)
        else setMapContainer(false, geoScopeParams);
    }

    else if(geoScopeType === GS_OPTIONS.SUB_NATIONAL){
        const blockData = data[activeBlock];
        const coordinates = blockData.subnation_point?.coordinates;
        geoScopeDetailsLabels = data.map((scopeInfo: any) => scopeInfo.name);
        geoScopeValues = [
            geoScopeType,
            blockData?.name,
            blockData?.country?.short_name,
            !blockData?.type_other || blockData?.type_other === '' ? blockData?.type : blockData?.type_other
        ];

        if(coordinates?.length > 0) getAndSetLatLong(coordinates, geoScopeParams)
        else setMapContainer(false, geoScopeParams);
    }

    else if(geoScopeType === GS_OPTIONS.NATIONAL){
        const blockData = data[activeBlock];
        const coordinates = blockData.country?.country_point?.coordinates;
        geoScopeDetailsLabels = data.map((scopeInfo: any) => scopeInfo.country?.short_name);
        geoScopeValues = [
            geoScopeType,
            blockData.country?.short_name
        ];

        if(coordinates?.length > 0) getAndSetLatLong(coordinates, geoScopeParams)
        else setMapContainer(false, geoScopeParams);
    }

    else if(geoScopeType === GS_OPTIONS.REGIONAL){
        const blockData = data[activeBlock];
        const coordinates = blockData.region?.region_point?.coordinates;
        let countries = '';
        blockData.countries?.map((country:any) => {
            countries += getCountryNameFromCode(country.country_id) + ', ';
        });
        geoScopeDetailsLabels = data.map((scopeInfo: any) => scopeInfo.region_name_other || scopeInfo.region?.region_name);
        geoScopeValues = [
            geoScopeType,
            blockData.region_name_other || blockData.region?.region_name,
            countries === '' ? 'N/A' : countries.slice(0, -2)
        ];

        if(coordinates?.length > 0) getAndSetLatLong(coordinates, geoScopeParams)
        else setMapContainer(false, geoScopeParams);
    }

    else {
        if(geoScopeType === GS_OPTIONS.GLOBAL) geoScopeValues = [ GS_OPTIONS.GLOBAL ];
        else geoScopeValues = [ GS_OPTIONS.NOT_SPECIFIC ];
        setMapContainer(false, geoScopeParams);
    }

    // Get the labels for appropriate geographic scope
    const geoScopeLabels = getGeoScopeLabel(geoScopeType);
    return { geoScopeLabels, geoScopeDetailsLabels, geoScopeValues };
}


export const getAndSetLatLong = (coordinates: Array<number>, geoScopeParams: getGeoScopeDetailsInfo) => {
    const long = coordinates[0];
    const lat = coordinates[1];
    setLatLong(lat, long, geoScopeParams);
}


export const setLatLong = (lat: number, long: number, geoScopeParams: getGeoScopeDetailsInfo) => {
    if(!lat || !long) {
        setMapContainer(false, geoScopeParams);
        return;
    }

    const { panel } = geoScopeParams;

    setMapContainer(true, geoScopeParams);
    const attribution = "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>";
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = new L.TileLayer(tileUrl, { attribution });
    const mapCentered = new L.LatLng(lat, long);
    const map = new L.Map('details-map' ,{
        center: mapCentered,
        zoom: 2,
        layers: [tiles]
    });

    const markerIcon = L.icon({
        iconUrl: getPanelIconFromCode(panel)
    });

    const marker =
        L.marker(mapCentered, {
            icon: markerIcon
        }).addTo(map);

    let popupHTML = setMapPopup(geoScopeParams);
    marker.bindPopup(popupHTML);
}


export const setMapContainer = (hasMap: boolean, geoScopeParams: getGeoScopeDetailsInfo) => {
    const { mapSection, renderer } = geoScopeParams;
    const currentContainer = mapSection.nativeElement.querySelector('#details-map');
    if(currentContainer) currentContainer.remove();
    const mapContainer = renderer.createElement('div');
    mapContainer.setAttribute("id", "details-map");
    if(!hasMap){
        mapContainer.innerText = 'No map specified for this geographic scope';
        mapContainer.style.height = 'auto';
    }
    const mapHeader = mapSection.nativeElement.querySelector('#map-header');
    mapHeader.parentNode.insertBefore(mapContainer, mapHeader.nextSibling);
}


export const setMapPopup = (geoScopeParams: getGeoScopeDetailsInfo) => {
    const { activeBlock, type, values } = geoScopeParams;
    const gsLabels = getGeoScopeLabel(type);
    let popupHTML = "", labelValue = "";
    for(let i in gsLabels) {
        if (parseInt(i) == 0) labelValue = values[i];
        else labelValue = values[i][activeBlock];
        popupHTML += "<strong>" + gsLabels[i] + ": </strong>" + labelValue +"<br>"
    }
    return popupHTML;
}
