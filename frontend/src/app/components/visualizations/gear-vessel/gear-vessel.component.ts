import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { getAllCountriesUrl } from '../../../constants/api';
import { get } from '../../../helpers/apiCalls';
import * as d3 from 'd3';


@Component({
    selector: 'app-gear-vessel',
    templateUrl: './gear-vessel.component.html',
    styleUrls: ['./gear-vessel.component.css'],
    encapsulation:ViewEncapsulation.None
})


export class GearVesselComponent implements OnInit {
    @Input() data : any
    countries: any;
    countryList: string[];
    selectedCountry: string = 'Canada';
    gearType: string = 'Main gear type(s)';
    vesselType: string = 'Main SSF vessel type(s)';
    countTypes: { numeric: string, percentage: string }  = {
        numeric: 'numeric',
        percentage: 'percentage'
    }
    attributeType: string = this.gearType;
    countType: string = this.countTypes.numeric;


    constructor() { }


    async ngOnInit(): Promise<void> {
        this.countries = await get(getAllCountriesUrl);
        this.countryList = this.countries.map((country: {short_name: string}) => country.short_name);
	      this.drawConsole(this.data);
	  }


    reCreateVisualization(country: string|Event, attributeType: string, countType: string){
        this.selectedCountry = typeof country === 'string' ? country : (country.target as HTMLFormElement).value;
        this.attributeType = attributeType;
        this.countType = countType;
        this.drawConsole(this.data);
    }


    private drawConsole(data: any): void {
        const countryName: string = this.selectedCountry;
        const attributeType: string = this.gearType;
        const extractedData = data[countryName] ? data[countryName][attributeType] : data['Canada'][attributeType];
        const dataKeys = Object.keys(extractedData);
        const currentData = [];
        let yAxisHighestValue = 0;
        if(data[countryName]){
            let totalValue = yAxisHighestValue;
            for(const key of dataKeys){
                yAxisHighestValue = extractedData[key] > yAxisHighestValue ? extractedData[key] : yAxisHighestValue;
                totalValue += extractedData[key];
                currentData.push({
                    label: key,
                    value: extractedData[key]
                });
            }

            if(this.countType === this.countTypes.percentage){
                for(const index in currentData){
                    const value = currentData[index].value;
                    const percentageValue = ((value * 100) / totalValue).toFixed(2);
                    currentData[index].value = percentageValue;
                }
                yAxisHighestValue = 100;
            }
        }
        else {
            for(const key of dataKeys){
                currentData.push({
                    label: key,
                    value: 0
                });
            }
        }

        data = currentData;
        const margin = {top: 30, right: 30, bottom: 150, left: 60};
        const width = 660 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      d3.select("#svg-container").selectAll("*").remove();
      const svg = d3.select("#svg-container")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // X axis
      const x = d3.scaleBand()
                  .range([ 0, width ])
                  .domain(data.map(d => d.label))
                  .padding(0.2);

      svg.append("g")
         .attr("transform", `translate(0, ${height})`)
         .call(d3.axisBottom(x))
         .selectAll("text")
         .attr("transform", "translate(-10,0)rotate(-45)")
         .style("text-anchor", "end")
         .style("font-size", "12px");

      // Add Y axis
      const y = d3.scaleLinear()
                  .domain([0, yAxisHighestValue])
                  .range([height, 0]);

      svg.append("g")
         .call(d3.axisLeft(y));

      // Bars
      svg.selectAll("mybar")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", d => x(d.label))
         .attr("y", d => y(d.value))
         .attr("width", x.bandwidth())
         .attr("height", d => height - y(d.value))
         .attr("fill", "#2699fd")
         .on("mouseover", function(d) {
              d3.select(this).style("fill", "#1e4f9e");
          })
          .on("mouseout", function(d) {
              d3.select(this).style("fill", "#2699fd");
          })
         .append("title")
         .attr("class", "title")
         .text(function(d){
             const value = `${d.label}: ${d.value}`;
             const isDecimalNumber = d.value.toString().split('.').length > 1;
             return isDecimalNumber ? value + '%' : value;
         });
    }
}

