import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import * as d3 from 'd3';
import * as d3geoProj from './d3-geo-projection.v2.min.js';
import { PANEL_CODES } from '../../../constants/constants';
import { Contents } from '../../../services/contents.service';


@Component({
    selector: 'app-country',
    templateUrl: './country.component.html',
    styleUrls: ['./country.component.css'],
    encapsulation: ViewEncapsulation.None
})


export class CountryComponent implements OnInit, OnChanges {
    @Input() data : any;
    @Input() selectedCountries: string[];

    panelCodes: Object;
    panelList: {code: string, label: string}[];
    countryName: string;
    totalWhoRecords: number;
    totalSotaRecords: number;
    totalProfileRecords: number;
    totalOrganizationRecords: number;
    totalCaseStudyRecords: number;
    totalBluejusticeRecords: number;
    totalGuidelinesRecords: number;
    totalRecords: number;


	  constructor(private contents: Contents) { }


    ngOnInit(): void {
        this.panelCodes = PANEL_CODES;
        this.panelList = this.contents.getPanelList();
        if(this.data) this.drawConsole(this.data);
    }


    ngOnChanges(changes: SimpleChanges): void {
        if(changes.data || changes.selectedCountries){
            let reDraw = false;
            if(changes.data && !changes.data.firstChange){
                this.data = changes.data.currentValue;
                reDraw = true;
            }
            if(changes.selectedCountries && !changes.selectedCountries.firstChange){
                this.selectedCountries = changes.selectedCountries.currentValue;
                reDraw = true;
            }
            if(reDraw) this.drawConsole(this.data);
        }
    }


    private drawConsole(data: any): void {
        document.getElementById('visual8_map').innerHTML = '';
		    let self = this;
		    let visual8Margin = {top: 0, right: 0, bottom: 0, left: 0},
		        visual8Width = 810 - visual8Margin.left - visual8Margin.right,
		        visual8Height = 615 - visual8Margin.top - visual8Margin.bottom;


        // Map and projection
		    let projection = d3geoProj.geoRobinson()
                                  .scale(165)
                                  .center([18,0])
                                  .translate([visual8Width / 2, visual8Height / 2]);


		    let path = d3.geoPath().projection(projection)
		    let zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", zoomed);


		    let visual8svg = d3.select("#visual8_map")
                           .append("svg")
                           .attr("id", "svgmap")
                           .attr("class", "svgmap")
                           .attr("preserveAspectRatio", "xMinYMin meet")
                           .attr("viewBox", "0 0 " + (visual8Width + visual8Margin.left + visual8Margin.right) + " " + (visual8Height + visual8Margin.top + visual8Margin.bottom))
                           .classed("svg-content", true);


		    let container =	visual8svg.append("g").attr("id","scroll_group");
        visual8svg.call(zoom);


        function zoomed() {
            let s = d3.event.transform.k;
            d3.selectAll("#map").style("stroke-width", 0.5 / s + "px");
            container.attr("transform", d3.event.transform);
        }


		    let tooltip = d3.select(".visual8_tooltip");


        d3.queue()
          .defer(d3.json, "/assets/vis/world.geojson")
          .await(ready, function(){
              console.log("map has loaded");
          });


		    function ready(error, topo) {
			      data = self.data;
			      let dataForRegion = data;
            dataForRegion.forEach(function(d){
                d.total = 0;
                if(PANEL_CODES.WHO in d) d.total += d[PANEL_CODES.WHO];
                if(PANEL_CODES.SOTA in d) d.total += d[PANEL_CODES.SOTA];
                if(PANEL_CODES.PROFILE in d) d.total += d[PANEL_CODES.PROFILE];
                if(PANEL_CODES.ORGANIZATION in d) d.total += d[PANEL_CODES.ORGANIZATION];
                if(PANEL_CODES.CASESTUDY in d) d.total += d[PANEL_CODES.CASESTUDY];
                if(PANEL_CODES.BLUEJUSTICE in d) d.total += d[PANEL_CODES.BLUEJUSTICE];
                if(PANEL_CODES.GUIDELINES in d) d.total += d[PANEL_CODES.GUIDELINES];
            });

            let heatMapRange = [0,20,50,100];
            let heatmapcolor = d3.scaleLinear()
                                 .domain(heatMapRange)
                                 .range(["#fcf09c", "#ffda6b", "#f9bb3e", "#fe9929"]);


            function findTotalColor(d){
                if(self.selectedCountries?.length > 0 && !self.selectedCountries?.includes(d)) return '#bbe4f1';
                let dataFilter = dataForRegion.filter(s => s.country == d);
                let result = heatmapcolor(dataFilter.map(s=> s.total));
                return result;
            }


            function findRegion(d){
                let dataFilter = dataForRegion.filter(s => s.country == d);
                let result = dataFilter.map(s => s.region);
                return result;
            }


			      // visual8svg.transition().duration(750).call( zoom.transform, d3.zoomIdentity );


			      /////////////////////////////////////////// MAP ///////////////////////////////////////////
			      // Draw the map
            container.append("g")
                     .attr("class", "maps")
                     .attr("id", "maps")
                     .selectAll("path")
                     .data(topo.features)
                     .enter()
                     .append("path")
                     // draw each country
                     .attr("d", path)
                     .attr("class","countries")
                     .attr("region", d => findRegion(d.properties.name))
                     .attr("id", "map")
                     .attr("name", d => d.properties.name)
                     .attr("color",d => findTotalColor(d.properties.name))
                     .style("stroke", "#777")
                     .style("opacity", .8)
                     .style("fill",d => findTotalColor(d.properties.name))
                     .on("mousemove", showTooltip)
                     .on("mouseleave", () => tooltip.classed("hidden", true));


			      function setHoverInfo(d) {
                let dataFilter = dataForRegion.filter(s => s.country == d);
                let thisCountry = dataFilter[0];
                self.countryName = thisCountry.country;
                self.totalWhoRecords = thisCountry[PANEL_CODES.WHO];
                self.totalSotaRecords = thisCountry[PANEL_CODES.SOTA];
                self.totalProfileRecords = thisCountry[PANEL_CODES.PROFILE];
                self.totalOrganizationRecords = thisCountry[PANEL_CODES.ORGANIZATION];
                self.totalCaseStudyRecords = thisCountry[PANEL_CODES.CASESTUDY];
                self.totalBluejusticeRecords = thisCountry[PANEL_CODES.BLUEJUSTICE];
                self.totalGuidelinesRecords = thisCountry[PANEL_CODES.GUIDELINES];
                self.totalRecords = thisCountry.total;
            }


			      function showTooltip(d) {
                if(self.selectedCountries?.length > 0 && !self.selectedCountries?.includes(d.properties.name)) return undefined;
                setHoverInfo(d.properties.name);
                tooltip.classed("hidden", false)
                       .style("left", (d3.event.pageX - 150) + "px")
                       .style("top", (d3.event.pageY - 540) + "px")
                       .on('mouseenter', () => tooltip.classed("hidden", false))
                       .on('mouseleave', () => tooltip.classed("hidden", true));
            }
        }
    }


	  getPanelInfo(panel: {value: string}) {
		    console.log("panelName: ", panel.value);
    }
}
