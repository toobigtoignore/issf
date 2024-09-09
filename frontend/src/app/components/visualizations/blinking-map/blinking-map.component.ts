import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { Contents } from '../../../services/contents.service';
import { PANEL_VALUES } from '../../../constants/constants';
import * as L from "leaflet";
import 'leaflet.markercluster';


@Component({
    selector: 'app-blinking-map',
    templateUrl: './blinking-map.component.html',
    styleUrls: ['./blinking-map.component.css']
})


export class BlinkingMapComponent implements OnInit {
    @Input() records : any;
    recordIndex: number = 0;
    toolTipInHoverState: boolean;


    constructor(
        private contents: Contents,
        private renderer: Renderer2,
    ) { }


    ngOnInit(): void {
        const latest10Records = [];
        let recordNumber = 1;
        for(let i = this.records.length - 1; i >= 0; i--){
            if(this.records[i].core_record_type !== PANEL_VALUES.WHO && this.records[i].points.length > 0){
                latest10Records.push(this.records[i]);
                recordNumber++;
            }
            if(recordNumber >= 10)
              break;
        }
        this.renderBlinkingMap(latest10Records);
    }


    renderBlinkingMap(records){
        const lat = records[0]['points'][0].coordinates[1];
        const long = records[0]['points'][0].coordinates[0];
        const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: "&copy; <a href='https://www.esri.com/en-us/home'>Esri</a>",
        });
        const uniqueMapId = 'map-' + new Date().valueOf();
        const mapDivContainer = document.getElementById('map-holder');
        if(mapDivContainer.innerHTML.trim() !== ''){
            mapDivContainer.firstElementChild.remove();
        }
        const mapContainer = this.renderer.createElement('div');

        mapContainer.setAttribute('id', uniqueMapId);
        mapContainer.style.width = '100%';
        mapContainer.style.height = '100%';
        mapContainer.style.backgroundColor = '#93d7f2';
        mapDivContainer.appendChild(mapContainer);

        const map = L.map(mapContainer,{
            center: L.latLng(lat, long),
            zoom: 3,
            minZoom: 3,
            maxZoom: 3,
            zoomControl: false,
            layers: [tiles]
        });

        for(let index = 0; index < records.length; index++){
            const record = records[index];
            const points = record['points'];
            if(points[0]?.coordinates){
                const coordinates = points[0].coordinates;
                const href = `/details/${this.contents.getPanelCodeFromLabel(record.core_record_type)}/${record.issf_core_id}`;
                L.marker(new L.LatLng(coordinates[1], coordinates[0]), {
                    icon: L.divIcon({
                        className: 'blinking-marker',
                        iconSize: [25, 41],
                        html: `
                            <div
                                class='marker-container'
                                style="display: ${index === 0 ? 'block' : 'none' };"
                                lat='${coordinates[1]}'
                                long='${coordinates[0]}'
                            >
                                <div class='toolInfo'>
                                    <a href='${href}' target='_blank'>
                                        <h3>${record.core_record_type}</h3>
                                        ${record.core_record_summary}
                                    </a>
                                </div>

                                <div class='marker-icon'>
                                    <img src='${this.contents.getPanelIconFromLabel(record.core_record_type)}' />
                                </div>
                            <div>
                        `
                    })
                }).addTo(map);
            }
        }

        this.blinkPoints(map);
    }


    blinkPoints(map): void {
        const self = this;
        const markers = document.getElementsByClassName('marker-container');
        const lat = parseFloat(markers[self.recordIndex].getAttribute('lat'));
        const long = parseFloat(markers[self.recordIndex].getAttribute('long'));
        const currentMarker = markers[self.recordIndex] as HTMLElement;

        currentMarker.addEventListener('mouseenter', () => self.toolTipInHoverState = true);
        currentMarker.addEventListener('mouseleave', () => self.toolTipInHoverState = false);

        if(self.recordIndex < markers.length){
            setTimeout(() => {
                if(!self.toolTipInHoverState){
                    map.flyTo([lat - 10, long - 5], 3, {
                        animate: true,
                        duration: 2,
                    });
                }
            }, 5000);

            setTimeout(() => {
                if(!self.toolTipInHoverState){
                    for(const marker of Array.from(markers)){
                        (marker as HTMLElement).style.display = 'none';
                    }
                    currentMarker.style.display = 'block';

                    self.recordIndex += 1;
                    if(self.recordIndex === markers.length){
                        self.recordIndex = 0;
                    }
                }
                self.blinkPoints(map);
            }, 6000);
        }
    }
}
