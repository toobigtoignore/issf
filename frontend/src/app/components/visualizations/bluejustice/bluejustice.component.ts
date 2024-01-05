import { Component, OnInit,ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3s from 'd3-scale-chromatic'


@Component({
	selector: 'app-bluejustice',
	templateUrl: './bluejustice.component.html',
	styleUrls: ['./bluejustice.component.css'],
	encapsulation:ViewEncapsulation.None
})


export class BluejusticeComponent implements OnInit {
	@Input() data : any

	constructor() {}
  
	ngOnInit(): void {
		this.drawConsole(this.data)	
	}
  
  	private drawConsole(data): void {
		var index,csv
		var data_types = data.columns.slice(3);
		var data_country = d3.map(data, function(d) { return d.ssf_country; }).keys().sort(d3.ascending)
		var data_array = []

		for(var i =0;i<data_country.length;i++){	
			var data_country_filtered = data.filter(m => (m.ssf_country == data_country[i]))
			var count_issf = d3.map(data_country_filtered, function(c){return c.issf_core_id;}).keys().length
			data_array.push({country: data_country[i], total: 0, record: count_issf})
			for(var j =0;j<data_types.length;j++){
				 data_array[i][data_types[j]] = 0
			}
		}
			
	
		for(var i =0;i<data.length;i++){
			index = data_array.findIndex(x => x.country === data[i].ssf_country)
			for(var j =0;j<data_types.length;j++){
				if (data[i][data_types[j]] != ""){
					data_array[index][data_types[j]] = data_array[index][data_types[j]] + 1
					data_array[index].total = data_array[index].total + 1
				}
			}
		}
		
	
		csv = data_array
		var keys = data_types
		// Define 'div' for tooltips
		var div = d3.select("#visual3")
			.append("div")  
			.attr("class", "bluejustice-tooltip")             
			.style("opacity", 0);                
		
		//SVG elements
        var svg = d3.select("#chart"),
            svgWidth = 900,
            svgHeight = 700,
			margin = {top: 75, left: 40, bottom: 0, right: 0},
			width = svgWidth - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom
        
        svg
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);
        
        var x = d3.scaleBand()
			.range([margin.left, width - margin.right])
			.padding(0.1)

		var y = d3.scaleLinear()
			.rangeRound([height - margin.bottom, margin.top])

		var xAxis = svg.append("g")
			.attr("transform", `translate(0,${height - margin.bottom})`)
			.attr("class", "x-axis")

		var yAxis = svg.append("g")
			.attr("transform", `translate(${margin.left},0)`)
			.attr("class", "y-axis")

		var z = d3.scaleOrdinal(d3s.schemeTableau10);

		//Legend
		var legspacing = 174;
		var legend = svg.selectAll(".legend")
			.data(data_types)
			.enter()
			.append("g")
					
		legend.append("rect")
			.attr("fill", function (d) {
				return z(d);
				})
			.attr("width", 20)
			.attr("height", 20)
			.attr("x", function (d, i) {
				return (i<=4)? (i * legspacing) + legspacing : ((i * legspacing) - (legspacing*5)) + legspacing;
				})
			.attr("y", function (d, i) {
				return (i<=4)?0:25;
				})
			.transition()
				.ease(d3.easeBack)
				.delay(0)
				.duration(1000)
				.attr("x", function (d, i) {
					return (i<=4)?i * legspacing : (i * legspacing) - (legspacing*5);
					});

		legend.append("text")
			.attr("class", "label")
			.attr("x", function (d, i) {
				return (i<=4)?i * legspacing+25 : (i * legspacing) - (legspacing*5)+25;
				})
			.attr("y", function (d, i) {
				return (i<=4)?15:40;
				})
			.attr("text-anchor", "start")
			.text(function (d, i) {
				return data_types[i];
				})
			.attr("opacity", 0)
			.transition()
					.ease(d3.easeLinear)
					.delay(500)
					.duration(2000)
			.attr("opacity", 1)
			.attr("font-size", 12);


		var data = csv

		y.domain([0, 2+d3.max(data, function(d) { return d.total; })]).nice();

		data.sort(d3.select("#sort").property("checked")
			? (a, b) => data_country.indexOf(a.country) - data_country.indexOf(b.country)
			: (a, b) => b.total - a.total)

		x.domain(data.map(d => d.country));

		var group = svg.selectAll("g.layer")
			.data(d3.stack().keys(keys)(data), d => d.key)

		group.exit().remove()
		group.enter().append("g")
			.classed("layer", true)
			.attr("fill", d => z(d.key));

		var bars = svg.selectAll("g.layer").selectAll("rect")
			.data(d => d, e => e.data.country)
		  
		bars.exit().remove()
			
		bars.enter().append("rect")
			.attr("width", x.bandwidth())
			.on("mouseover", function() { div.style("visibility", "visible");}) //.style("width", "100px")
			.on("mousemove", function(d) {	
				var typeName = d3.select(this.parentNode).datum().key; 
				var typeValue = d.data[typeName];
				var total = d.data.total;
				div.style("opacity", .9);
				
				div.html(
					 "<b>" + typeName + " : "  + typeValue +                 
					"</b><br>" + d.data.country + " : "  + total)
					
					.style("left", (d3.event.pageX + 15) + "px")			 
					.style("top", (d3.event.pageY - margin.top - 50) + "px");
				})
			.on("mouseout", function() { div.style("visibility", "hidden"); })
			.merge(bars)
			.transition().duration(0)
				.attr("x", d => x(d.data.country))
				.attr("y", d => y(0))
				.attr("height", d => 0)
			  
		
		//Max Count  
		var text = svg.selectAll(".text")
			.data(data, d => d.country);

		text.exit().remove()

		text.enter().append("text")
			.attr("class", "text")
			.attr("text-anchor", "middle")
			.merge(text)
		.transition().duration(0)
			.attr("x", d => x(d.country) + x.bandwidth() / 2)
			.attr("y", d => y(0) - 5)
			.text(d => d.record)

		update(1000)


		function update(speed) {
			var data = csv

			y.domain([0, 2+d3.max(data, function(d) { return d.total; })]).nice();

			svg.selectAll(".y-axis").transition().duration(speed)
				.call(d3.axisLeft(y).ticks(null, "s"))

			data.sort(d3.select("#sort").property("checked")
				? (a, b) => data_country.indexOf(a.country) - data_country.indexOf(b.country)
				: (a, b) => b.total - a.total)

			x.domain(data.map(d => d.country));

			svg.selectAll(".x-axis").transition().duration(speed)
				.call(d3.axisBottom(x).tickSizeOuter(0)).selectAll("text")	
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-35)");

			var group = svg.selectAll("g.layer")
				.data(d3.stack().keys(keys)(data), d => d.key)

			group.exit().remove()

			group.enter().append("g")
				.classed("layer", true)
				.attr("fill", d => z(d.key));

			var bars = svg.selectAll("g.layer").selectAll("rect")
				.data(d => d, e => e.data.country)
			  
			bars.exit().remove()
			
			bars.enter().append("rect")
				.attr("width", x.bandwidth())
				.on("mouseover", function() { div.style("visibility", "visible");}) //.style("width", "100px")
				.on("mousemove", function(d) {	
					var typeName = d3.select(this.parentNode).datum().key; 
					var typeValue = d.data[typeName];
					var total = d.data.total;
					div.style("opacity", .9);
					div.html(
						 "<b>" + typeName + " : "  + typeValue +                 
						"</b><br>" + d.data.country + " : "  + total)
						
						.style("left", (d3.event.pageX) + "px")			 
						.style("top", (d3.event.pageY - 45) + "px");
					})
				.on("mouseout", function() { div.style("visibility", "hidden"); })
				.merge(bars)
				.transition().duration(speed)
					.attr("x", d => x(d.data.country))
					.attr("y", d => y(d[1]))
					.attr("height", d => y(d[0]) - y(d[1]))
				  
			//Max Count  
			var text = svg.selectAll(".text")
				.data(data, d => d.country);

			text.exit().remove()

			text.enter().append("text")
				.attr("class", "text")
				.attr("text-anchor", "middle")
				.merge(text)
			.transition().duration(speed)
				.attr("x", d => x(d.country) + x.bandwidth() / 2)
				.attr("y", d => y(d.total) - 5)
				.text(d => d.record)
		  
		} 

		var checkbox = d3.select("#sort").on("click", function() {
			update(750)
		})
	}
}
