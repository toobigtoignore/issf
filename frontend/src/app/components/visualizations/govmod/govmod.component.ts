import { Component, OnInit,ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3ScaleRadial from './d3-scale-radial.js';


@Component({
	selector: 'app-govmod',
	templateUrl: './govmod.component.html',
	styleUrls: ['./govmod.component.css'],
	encapsulation:ViewEncapsulation.None
})


export class GovmodComponent implements OnInit {
	@Input() data : any
    
    
    constructor() {}
    
    
    ngOnInit(): void {
		this.drawConsole(this.data)
	}


	private drawConsole(data): void {
		var valueLabel_array;
		var visual1Width = 680;
 		var visual1Height = 680;
 

		// append the svg object to the body of the page
        var visual1Svg = d3.select(".svg-container")
			.append("svg")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 " + visual1Width + " " + visual1Height)
			.classed("svg-content", true)
			// .attr("width", visual1Width)
            // .attr("height", visual1Height)
            .style("border","1px solid #999")
            .style("border-radius","750px")
            .style("padding","9px")
            .style("cursor","grab");
        
        
        var g_scroll =	
            visual1Svg
            // Zoom
            // .call(d3.zoom().scaleExtent([1, 3]).on("zoom", function () {
			// 	g_scroll.attr("transform", d3.event.transform)
			// }))
			.append("g")
			.attr("id","scroll group");
		
		var g = g_scroll.append("g")
			.attr("id","main group")
			.attr("transform",
			"translate(" + visual1Width / 2 + "," + visual1Height / 2 + ")")
		
		var innerRadius = 130,
			outerRadius = Math.min(visual1Width, visual1Height) / 2
		
		var x = d3.scaleBand()
			.range([0, 2 * Math.PI])
			.align(0);
		
		var y = d3ScaleRadial.scaleRadial()
			.range([innerRadius, outerRadius]);
		
		var z = d3.scaleOrdinal()
			.range(["#3f51b5", "#d81b60", "#4caf50", "#964b00", "#000000"]);
		
		var tooltipPopsup = d3.select("#visual1").append("div")
			.attr("class", "visual1_tooltip")
			.style("opacity", 0);
		
		var mouseover = function(d) {
			var visualSection = document.getElementById("visual-section");
			var html = "Country : " + d.data.country + " | Records : " + d.data.record +"<br/>"; 
			valueLabel_array.forEach(function (c) { 
				html = html + "<font color=" + z(c) + ">" + c + ": " + d.data[c] + "</font><br/>"; 
			})
			html = html + "Total : " + d.data.total + "<br/>"; 
			tooltipPopsup.html(html)
						 .style("left", (d3.event.pageX + 10) + "px")
						 .style("top", (d3.event.pageY - 150) + "px")
						 .transition()
						 .duration(200) 
						 .style("opacity", 1) 

		d3.select(this)
		  .style("stroke", "black")
		  .style("opacity", 1)
		};		
		
		var mouseleave = function(d) {
			tooltipPopsup.transition()
						 .duration(300) // ms
						 .style("opacity", 0); // don't care about position!
			d3.select(this)
			  .style("stroke", "none")
			  .style("opacity", 1)
		};
		
		var rotate = 0;
		var data_nested = d3.nest()
			 				.key(function(d) { return d.country; }).sortKeys(d3.ascending)
			 				.key(function(d) { return d.valueLabel; })
			 				.rollup(function(v) { 
			 					return {
									length: v.length
								}; 
						})
			 			.entries(data);
		
		valueLabel_array = d3.map(data, v => v.valueLabel).keys();
		var new_data = [];
		data_nested.forEach(function (d, i) {
			new_data.push({country: d.key, total: 0, record: 0})
			var data_country_filtered = data.filter(m => (m.country == d.key))
			var count_issf = d3.map(data_country_filtered, function(c){return c.issf_core_id;}).keys().length
			new_data[i].record = count_issf
			
			valueLabel_array.forEach(function (c) { 
				new_data[i][c] = 0
			});
			
			var total = 0
			d.values.forEach(function (v) {
				new_data[i][v.key] = v.value.length
				total = total + v.value.length
			})
			new_data[i].total = total	
		})
			
		data = new_data
		x.domain(data.map(function(d) { return d.country; }));
		y.domain([0, d3.max(data, function(d) { return d.total; })]);
		z.domain(valueLabel_array);
	 
		var arc = g.append("g")
			.attr("id", "arc");
 
		arc.append("g")
			.selectAll("g")
			.data(d3.stack().keys(valueLabel_array)(data))
			.enter()
			.append("g")
			.attr("fill", function(d) { return z(d.key); })
			.selectAll("path")
			.data(function(d) { return d; })
			.enter()
			.append("path")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.attr("id", function(d) { return d; })
			.attr("d", d3.arc()
			.innerRadius(function(d) { return y(d[0]); })
			.outerRadius(function(d) { return y(d[1]); })
			.startAngle(function(d) { return x(d.data.country); })
			.endAngle(function(d) { return x(d.data.country) + x.bandwidth(); })
			.padAngle(0.01)
			.padRadius(innerRadius));
 
		var gg = g.selectAll("g")	
 
		var label_dr = d3.arc().outerRadius(500).innerRadius(0);
 
		var visual1MovingDuration = 2000 //10
		var timer, moving
		function movingStart() {
			moving = true;
			movingAction()
			timer = setInterval(movingAction, visual1MovingDuration);
		}
		
		function movingStop() {
			moving = false;
			clearInterval(timer)
		}
			
		function movingAction() { 
			rotate = rotate + 10; //.1
			gg.transition()
				.attr("transform", "rotate(" + rotate + ")")
				.duration(visual1MovingDuration);
			 
			label.transition()
				.attr("text-anchor", "right")																					//"translate(" + (y(d['Value'])+10) + ",0)"; })
				.attr("transform", function(d) { return "rotate(" + (2*rotate+(x(d.country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + (y(d['total'])+10) + ",-10)"; })
				.duration(visual1MovingDuration);				
		};
		
		function onHover() {
			if (moving == true) {movingStop()} else {movingStart()}
		}
								
        d3.select(".svg-container")
            .on("mouseenter", onHover)
            .on("mouseleave", onHover)

		var label = arc.append("g")
			.attr("id","label")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.attr("id","labels")
			.attr("text-anchor", "right")																					//"translate(" + (y(d['Value'])+10) + ",0)"; })
			.attr("transform", function(d) { return "rotate(" + ((x(d.country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + (y(d['total'])+10) + ",-10)"; });

		var text = label.append("text")
						.attr("transform", function(d) { return (x(d.country) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,15)" : "rotate(-0)translate(0,15)"; })
						.text(function(d) { return d.country+" "+d.record; })
						.attr("font-weight","normal")
						.style("font-size", "13px")
						.style("font-family", "sans-serif"); 

		 var yAxis = g.append("g")
					  .attr("id","yAxis")
					  .attr("text-anchor", "middle");

		 var yTick = yAxis.selectAll("g")
						  .data(y.ticks(5).slice(1))
						  .enter().append("g")
						  .attr("id","yTick");
 
		 yTick.append("circle")
			  .attr("fill", "none")
			  .attr("stroke", "#000")
			  .attr("stroke-width", 0.4)
			  .attr("r", y)
			  .style("opacity", 1);
		
		 yTick.append("text")
			  .attr("y", function(d) { return -y(d); })
			  .attr("dy", "0.35em")
			  .attr("fill", "none")
			  .attr("stroke-width", 5)
			  .text(y.tickFormat(5, "s"));
			
		 yTick.append("text")
	  		  .attr("y", function(d) { return -y(d); })
			  .attr("dy", "0.35em")
			  .text(y.tickFormat(5, "s"))
			  .style("opacity", 0.4);;

		 yAxis.append("text")
			  .attr("y", function(d) { return -y(y.ticks(5).pop()); })
			  .attr("dy", "-1em")
			  .style("font-size", "18px")
			  .style("font-weight", "400")
			//   .text("No. of each type");
			 
		 var legend = g.append("g")
					   .attr("id","legend")
					   .selectAll("g")
					   .data(valueLabel_array)
					   .enter()
					   .append("g")
					   .attr("id","legends")
					   .attr("transform", function(d, i) { 
					   		return "translate(-110," + (i - (valueLabel_array.length) / 2) * 20 + ")"; 
					   	});
 
		 legend.append("rect")
			   .attr("width", 18)
			   .attr("height", 18)
			   .attr("fill", z);
		
		 legend.append("text")
			   .attr("x", 24)
			   .attr("y", 9)
			   .attr("dy", "0.35em")
			   .style("font-size", "13px")
			   .style("font-family", "sans-serif")
			   .text(function(d) { return d; }); 

		g.style('transform', 'translate(50%, 50%)');
		movingStart()
  	}
}
