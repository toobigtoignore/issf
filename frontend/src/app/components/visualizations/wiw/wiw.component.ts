import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';


@Component({
    selector: 'app-wiw',
    templateUrl: './wiw.component.html',
    styleUrls: ['./wiw.component.css'],
    encapsulation:ViewEncapsulation.None
})


export class WiwComponent implements OnInit {
    @Input() data : any

    
    constructor() { }

    
    ngOnInit(): void {
        this.drawConsole(this.data)
    }
 

    private drawConsole(data): void {
	    var visualWIWwidth = 700, visualWIWheight = 700, visualWIWwidthTable = 250	
		var visualWIWsvg = d3.select("#visual-wiw #chartDiv").append("svg")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 "+visualWIWwidth+" "+visualWIWheight)
			.classed("svg-content", true)
			// .attr("width", visualWIWwidth)
			// .attr("height", visualWIWheight)
			
        
        d3.select("#visual-wiw #tableDiv")
          .style("height", "77vh") //visualWIWheight-70+"px")
          .style("width", "101%") //visualWIWwidthTable+"px")
          .style("border", "1px solid #e3e3e3");
    
    
        var Duration = 500;
		var worldY = 80;
		const forceStrengthInitial = 0.03;
		const forceStrength = 0.2;
		
        
        // charge depends on size of the bubble, so bigger towards the middle
		function charge(d) {
			return Math.pow(d.radius, 2.0) * 0.01
		}
		
        
        // create a force simulation and add forces to it
        const simulation = 
            d3.forceSimulation()
			  .force('charge', d3.forceManyBody().strength(charge))
			  .force('x', d3.forceX().strength(forceStrengthInitial).x(visualWIWwidth * .5))
			  .force('y', d3.forceY().strength(forceStrengthInitial)
			  .y(d => (d.group == "World") ? worldY : visualWIWheight * .5))
			  .force('collision', d3.forceCollide().radius(d => d.radius + 1));


		// force simulation starts up automatically, which we don't want as there aren't any nodes yet
		simulation.stop();
		

        var color = d3.scaleOrdinal(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#c9fdff"]); //, "#e5c494", "#b3b3b3"]);	
        
        data = data.filter(function(d){return d.country__short_name != ''});		
        var data_who_country = d3.nest()
            .key(function(d) { return d.country__short_name})
            .rollup(function(v) { return {
                length: v.length
            }; })
            .entries(data);
        

        var new_data = []
        data_who_country.forEach(function (d) {				
            var data_country_filtered = data.filter(m => (m.country__short_name == d.key))
            var region = d3.map(data_country_filtered, function(c){return c.region;}).keys()[0]
            new_data.push({Name: d.key, radius: d.value.length, group: region})
        })


        var Regions1 = ["Latin America & the Caribbean", "Europe"] //, "North America & Canada"
        var Regions2 = [ "Africa", "Asia & Oceania" ]
        new_data.forEach(function (d) {
            d.vert = ((Regions1.indexOf(d.group) === -1) ? 2 : 1)
            d.count = +d.radius
        })
                
        
        var nodes = new_data
        var min = d3.min(nodes, d=>d.radius)
        var max = d3.max(nodes, d=>d.radius)
        var sum = d3.sum(nodes, d=>d.radius)
        var groups = d3.map(nodes, d=>d.group).keys()
        nodes.push({Name: "World", group: "World", radius: 70, vert: 1})
        var groupClass = d3.scaleOrdinal()
            .domain(["Africa", "Europe", "North America & Canada", "Latin America & the Caribbean", "Asia & Oceania", "World"])
            .range(["Africa", "Europe", "America", "Latin", "Asia", "World"]);
        
        var worldRadius = (visualWIWheight/2)*.85
        var radiusScale = d3.scaleLinear()
            .domain([min, max, sum])
            .range([26, 70, worldRadius]);
		var visualWIWsvg = d3.select('#visual-wiw svg');
				
        
        ///////////////////////////////////////////REGION LEGENDS///////////////////////////////////////////
        groups.sort(d3.ascending).push("World")
        var barMargin = 270
        var bars = visualWIWsvg.selectAll("rect").data(groups)

        bars.enter()
            .append("rect")
            .attr("id", d => d)
            .attr("width", 20)
            .attr("height", 20)
            .attr("cursor", "pointer")
            .merge(bars)
            .attr('x', (d,i)=> 20)
            .attr('y', (d,i)=> (i <= 2) ? 5 : 30)
            .attr("fill", d=> color(d))
            .on("mouseover", function(d) { 
                if (d!="World"){
                    circles.attr("opacity", d=> d.group == "World" ? 0 : 0.2)
                    lables.attr("opacity", d=> d.group == "World" ? 0 : 0.2)
                    countLables.attr("opacity", d=> d.group == "World" ? 0 : 0.2)
                    d3.selectAll("."+groupClass(d))
                        .attr("opacity", d=> d.group == "World" ? 0 : 1)
                }
            }) 
            .on("mouseout", function() { 
                circles.attr("opacity", d=> d.group == "World" ? 0 : 1)
                lables.attr("opacity", d=> d.group == "World" ? 0 : 1)
                countLables.attr("opacity", d=> d.group == "World" ? 0 : 1)
            })
            .on("click", function () {
                var country = d3.select(this).attr("id")
                if (country == "World"){
                    var tableData = data
                    .sort((a,b) => b.number_publications - a.number_publications)
                } else {
                    var tableData = data.filter(d => d.region == country)
                        .sort((a,b) => b.number_publications - a.number_publications)
                }
                updateTable(tableData, country)
            })
            .transition()
            .ease(d3.easeLinear)
            .delay(0)
            .duration(1000)
            .attr('x', (d,i)=> (i <= 2) ? i*barMargin + 20 : i*barMargin - barMargin*3 + 20)
                
            
        var titles = visualWIWsvg.selectAll('.title').data(groups);
        titles.enter()
              .append('text')
              .attr('class', 'title')
              .attr("text-anchor", "start")
              .attr("font-family", "sans-serif")
              .style("font-size", "15px")
              .attr('x', (d,i)=> (i <= 2) ? i*barMargin+45 : i*barMargin+25-barMargin*3 + 20)
              .attr('y', (d,i)=> (i <= 2) ? 20 : 45)
              .text(d=>d)
              .style('opacity', 0.0)
              .transition()
              .ease(d3.easeLinear)
              .delay(500)
              .duration(2000)
              .style('opacity', 1.0)
                
                
         /////////////////////////////////////////// WORLD CIRCLE ///////////////////////////////////////////
        d3.selection.prototype.moveToBack = function() {
            return this.each(function() { 
                var firstChild = this.parentNode.firstChild; 
                if (firstChild) { 
                    this.parentNode.insertBefore(this, firstChild); 
                } 
            });
        };
            

        var world = 
            visualWIWsvg
                .append("g")
                .attr("transform", function(d) {
                    return "translate ( " + visualWIWwidth/2 + "," + (visualWIWheight/2 + 40) + ")";
                })
                .attr("class", "world circle")
                .data(["World"])
        
        world.append("circle")
             .attr("id", "World")
             .attr("r", radiusScale(sum))
             .attr("fill", "#c9fdff")
             .on("click", mouseClick)
            
        var worldText = 
            world.append("text")
                 .attr("id", "World")
                 .attr("text-anchor", "middle")
                 .attr("font-family", "sans-serif")
                 .text(function(d) {
                    return d;
                 })
                 .attr("font-size", 20)
                 .attr('x', 0)
                 .attr('y', 30-worldRadius)
                 .on("click", mouseClick);
            
                        
        var worldCount = 
            world.append("text")
                 .attr("id", "World")
                 .attr("text-anchor", "middle")
                 .attr("font-family", "sans-serif")
                 .attr("font-size", 20)
                 .text(sum)
                 .attr('x', 0)
                 .attr('y', 50-worldRadius)
                 .on("click", mouseClick);
            
            world.moveToBack();
                
                    
			///////////////////////////////////////////COUNTRY CIRCLES///////////////////////////////////////////
            function createNodes(rawData) {
                // use map() to convert raw data into node data
                const myNodes = rawData.map(d => ({
                    ...d,
                    radius: radiusScale(+d.radius),
                    x: (d.group == "World") ? visualWIWwidth/2 : Math.random() * visualWIWwidth,
                    y: (d.group == "World") ? worldY : (Math.random() * (1 - .1) + .1) * visualWIWheight
                }))
                return myNodes;
            }


            nodes = createNodes(nodes);			
            var node = 
                visualWIWsvg.append("g")
                            .attr("class", "nodes circle")
                            .selectAll("g")
                            .data(nodes)
                            .enter()
                            .append("g")
        
                            
            var circles = 
                node.append("circle")
                    .attr("class", d=> groupClass(d.group))
                    .attr("id", d=> d.Name)
                    .attr("opacity", d=> (d.group == "World") ? 0 : 1)
                    .style("pointer-events", d=> (d.group == "World") ? "none" : "")
                    .attr("r", d=>d.radius)
                    .attr("fill", d=> color(d.group))
                    .on("click", mouseClick)

                    
            var lables = 
                node.append("text")
                    .attr("class", d=> groupClass(d.group))
                    .attr("id", d=> d.Name)
                    .attr("opacity", d=> (d.group == "World") ? 0 : 1)
                    .style("pointer-events", d=> (d.group == "World") ? "none" : "")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .text(function(d) { return d.Name; })
                    .attr("font-size", function(d){ 
                        return (d.Name == "United Kingdom") ? d.radius/4 : d.radius/3; 
                    })
                    .attr('x', 0)
                    .attr('y', 0)
                    .on("click", mouseClick);
        

            var countLables = 
                node.append("text")
                    .attr("class", d=> groupClass(d.group))
                    .attr("id", d=> d.Name)
                    .attr("opacity", d=> (d.group == "World") ? 0 : 1)
                    .style("pointer-events", d=> (d.group == "World") ? "none" : "")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", function(d){ return (d.Name == "United Kingdom") ? d.radius/4 : d.radius/3; })
                    .text(d=> d.group == "World" ? sum : d.count)
                    .attr('x', 0)
                    .attr('y', d=>d.radius/2)
                    .on("click", mouseClick);
            
                    
            function mouseClick(d) {
                var country = d3.select(this).attr("id")
                if (country == "World"){
                    var tableData = data
                    .sort((a,b) => b.number_publications - a.number_publications)
                } else {
                    var tableData = data.filter(d => d.country__short_name == country)
                        .sort((a,b) => b.number_publications - a.number_publications)
                }
                updateTable(tableData, country)
            }
            
            
            simulation
                .nodes(nodes)
                .on('tick', ticked)
                .restart();
                    

            ///////////////////////////////////////////PUBLICATIONS TABLE///////////////////////////////////////////
            var legend = 
                d3.select("#tableDiv")
                    .append("table")
                    .attr('id','publications')
                    .attr("width", "100%");
					

            var header = legend.append("thead");
            var headerCountry = 
                header.append("tr")
                        .selectAll("th")
                        .data(["World ("+sum+")"])
                        .enter()
                        .append("th")
                        .attr("class", "headerCountry")
                        .style("font-size", "18px")
                        .style("font-weight", "normal")
                        .attr("align", "center")
                        .attr("colspan", 3)
                        .text(d=>d);
            
            header.append("tr")
                    .selectAll("th")
                    .data(["Researchers"])
                    .enter()
                    .append("th")
                    .attr("width", "10%")
                    .attr("align", "middle")
                    .style("font-size", "15px")
                    .attr("colspan", 2)
                    .text(d=>d);
            
            
            var tableData = data.sort((a,b) => b.number_publications - a.number_publications)
            var tr = 
                legend.append("tbody")
                        .selectAll("tr")
                        .data(tableData)
                        .enter()
                        .append("tr");


            // create the first column for each segment.
            tr.append("td")
                .append("svg")
                .attr("width", '15px')
                .attr("height", '15px')
                .append("rect")
                .attr("width", '15px')
                .attr("height", '15px')
                .attr("fill",d=> color(d.region));


            // create the second column for each segment.
            tr.append("td")
                .attr("class",'legendPublisher')
                .attr("font-family", "sans-serif")
                .style("font-size", "15px")
                .style("width", "10px")
                .text(d=> d["core_record_summary"]);

                
            function updateTable(tableData, country) {
                headerCountry.text(country+" ("+tableData.length+")")
                var tr = legend.select("tbody").selectAll("tr")
                tr.remove();
                var tr = legend.select("tbody").selectAll("tr").data(tableData)
                var trEnter = tr.enter().append("tr");
                trEnter
                    .append("td")
                    .append("svg")
                    .attr("width", '15px')
                    .attr("height", '15px')
                    .append("rect")
                    .attr("width", '15px')
                    .attr("height", '15px')
                    .attr("fill",d=> color(d.region))
                        
                trEnter
                    .append("td")
                    .attr("class",'legendPublisher')	
                    .attr("font-family", "sans-serif")
                    .style("font-size", "15px")
                    .style("width", "10px")
                    .text(d=> d["core_record_summary"])
                        
                trEnter
                    .style('opacity', 0.0)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .style('opacity', 1.0);
            }
                
                
            ///////////////////////////////////////////SIMULATIONS///////////////////////////////////////////
            function ticked() {
                node.attr("transform", function(d) {
                    return "translate(" + d.x + "," + (d.y + 40) + ")";
                })
            }
            

            var padding = .4
            var paddingY = .6				
            var centerScaleX1 = d3.scalePoint().padding(padding).range([0, visualWIWwidth]);
            var centerScaleX2 = d3.scalePoint().padding(padding).range([0, visualWIWwidth]);
            var centerScaleY = d3.scalePoint().padding(paddingY).range([0, visualWIWheight]);
                
                
            function splitBubbles(byVar) {
                centerScaleX1.domain(Regions1);
                centerScaleX2.domain(Regions2);
                centerScaleY.domain([1,2]);
                
                lables.attr("opacity", d=>d.group == "World" ? 0 : 1)
                countLables.attr("opacity", d=>d.group == "World" ? 0 : 1)
                worldText.attr("opacity", 1)
                worldCount.attr("opacity", 1)
                
                if(byVar == "all"){	
                    simulation
                        .force('forceX', d3.forceX().strength(forceStrengthInitial).x(visualWIWwidth/2))
                        .force("forceY", d3.forceY().strength(forceStrengthInitial)
                        .y(d=> (d.group == "World") ? worldY : visualWIWheight * .5))
                        .alpha(1).restart();
                } else {
                    simulation
                        .force('forceX', d3.forceX().strength(forceStrength)
                            .x(d=> (d.group == "North America & Canada" || d.group == "World") ? visualWIWwidth * .5 : (d.vert == 1) ? centerScaleX1(d.group) : centerScaleX2(d.group))
                        )
                        .force('forceY', d3.forceY().strength(forceStrength)
                                .y(d=> (d.group == "World") ? worldY : (d.group == "North America & Canada") ? visualWIWheight * .5 : centerScaleY(d.vert))
                        )
                        .alpha(1).restart();
                }
            }
                
                
			function setupButtons() {
                d3.selectAll('.button')
                  .on('click', function () {
                        d3.selectAll('.button').classed('active', false);
                        var button = d3.select(this);
                        button.classed('active', true);
                        var buttonId = button.attr('id');
                        splitBubbles(buttonId);
                    }
                );
			}
		setupButtons();
    }
}
