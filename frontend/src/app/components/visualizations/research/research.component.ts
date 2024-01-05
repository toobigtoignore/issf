import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3s from 'd3-scale-chromatic';


@Component({
    selector: 'app-research',
    templateUrl: './research.component.html',
    styleUrls: ['./research.component.css'],
    encapsulation:ViewEncapsulation.None
})


export class ResearchComponent implements OnInit {
	@Input() data : any

    
    constructor() { }

  
    ngOnInit(): void {
	    this.drawConsole(this.data)
    }


    private drawConsole(data): void {
	    var sota = data;
	    var visual7Width = 700;
		var visual7Height = 500;
		var marginV = 20;
		var marginH = 30;
		var duration = 250;
		
		var pieDim = {
            w: 200, 
            h: 400,
            r: null
        };

		pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

		var lineOpacity = ".5";
		var otherLinesOpacityHoverRegion = ".4";
		var lineOpacityHover = "1";
		var otherLinesOpacityHover = "0.1";
		var lineStroke = "1.5px";
		var lineStrokeHover = "2.5px";
		var circleOpacity = '1';
		var circleOpacityOnLineHover = "0.25"
		var circleRadius = 3;
		var circleRadiusHover = 6;
		var xTick = 10;
		var yTick = 3;
        var lock = d3.select("#visual7-lockCheckbox").property("checked") ? 1 : 0;
        var form_val = "total";
			
        
        /////////////////////////////////////////// DATA ///////////////////////////////////////////
		sota = sota.filter(function(d){return d.country != '' && d.country != '0' && d.year>=1000});
        var uniqueCountryArray = d3.map(sota, d => d.country).keys().sort(d3.ascending)
        var type = d3.map(sota, d => d.theme_issue_category).keys().sort(d3.ascending)
        var regions = d3.map(sota, d => d.region).keys()
        var data_sota_country = 
            d3.nest()
              .key(function(d) { return d.country}).sortKeys(d3.ascending)
              .key(function(d) { return d.year}).sortKeys(d3.ascending)
              .rollup(function(v) { 
                    return {
                        total: v.length
                    }; 
                })
              .entries(sota);
			
        var data_sota_region = 
            d3.nest()
              .key(function(d) { return d.region}).sortKeys(d3.ascending)
              .rollup(function(v) { 
                  return {
                      total: v.length
                  }; 
              })
              .object(sota);
            
              
        regions.forEach (function(d) {
            var data_regions_filtered = sota.filter(m => (m.region == d))
            var records = d3.map(data_regions_filtered, m=> m.issf_core_id).keys().length
            data_sota_region[d].record = records
        })
			
        var Global = "Global Data";
        var new_data = [];
        data_sota_country.forEach(function (d,i) {
            var data_country_filtered = sota.filter(m => (m.country == d.key))
            var region = d3.map(data_country_filtered, m=>m.region).keys()[0]
            new_data.push({name: d.key, region: region, values: []})
            d.values.forEach(function (v) {
                var data_year_filtered = data_country_filtered.filter(m => (m.year == v.key))
                var records = d3.map(data_year_filtered, m=> m.issf_core_id).keys().length
                new_data[i].values.push({date: v.key, total: v.value[form_val], name: d.key, record: records, region: region})
            })
        })

        var pD = d3.nest()
                    .key(function(d) { return d.theme_issue_category}).sortKeys(d3.ascending)
                    .rollup(function(v) { 
                        return {
                            total: v.length
                        }; 
                    })
                    .entries(sota);

        pD.forEach(function(d){
            var sota_filtered = sota.filter(m => (m.theme_issue_category == d.key))
            var count_issf = d3.map(sota_filtered, d => d.issf_core_id).keys().length
            d.value.record = count_issf
        })
		
        var data: any = new_data;
        var maxValue = d3.max(data, d => d3.max(d.values, v => v[form_val]));
        var minValue = d3.min(data, d => d3.min(d.values, v => v[form_val]));


        /////////////////////////////////////////// lineChart ///////////////////////////////////////////
        var xScale = d3.scaleLinear()
                        .domain(d3.extent(sota, d => d.year))
                        .range([0, visual7Width-marginH]);
        
        if (form_val=="total"){
            var yScale = d3.scaleLog()
                            .domain([1, maxValue])
                            .range([visual7Height-marginV, 0])
        } else {
            var yScale = 
                d3.scaleLinear()
                  .domain([0, maxValue])
                  .range([visual7Height-marginV, 0]);
        }

		var color = d3.scaleOrdinal(d3s.schemeTableau10);
        var svg = 
            d3.select("#visual7-chart")
                .append("svg")
                .classed("svg-content", true)
                // .attr("width", (visual7Width+marginH)+"px")
                // .attr("height", (visual7Height+marginV)+"px")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + (visual7Width + marginH) + " " + (visual7Height + marginV))
                .append('g')
                .attr("transform", `translate(${marginH}, ${marginV})`);
            
        svg.append("text")
            .attr("class", "title-text")
            .style("font-size", "18px")
            .style("fill", "black") //d3.rgb(color(i)).darker(10))
            .text(Global + " | Themes (" + sota.length + ")"+ " | Records (" + d3.map(sota, d => d.issf_core_id).keys().length + ")")
            .attr("text-anchor", "middle")
            .attr("x", (visual7Width-marginH)/2)
            .attr("y", 5);

        var line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d[form_val]));

        var lines = svg.append('g').attr('class', 'lines');
        lines.selectAll('#visual7 .line-group')
            .data(data).enter()
            .append('g')
            .attr('class', 'line-group')
            .style("cursor", "pointer")
            .on("mouseover", function(d, i) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text()
                if (lock == 0 || (d.name == selected_init) || (regions.indexOf(selected_init) != -1)){  
                    var total = d3.sum(d.values, t => t[form_val])
                    var record = d3.sum(d.values, t => t.record)                  
                    svg.select("#visual7 .title-text").remove();
                    svg.append("text")
                    .attr("class", "title-text")
                    .style("font-size", "18px")
                    .style("fill", "black")
                    .text(d.name + " | Themes (" + total + ")"+ " | Records (" + record + ")")
                    .attr("text-anchor", "middle")
                    .attr("x", (visual7Width-marginH)/2)
                    .attr("y", 5);
                }
            })
            .append('path')
            .attr('id', d => d.name.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_"))
            .attr('class',d=> 'line ' + d.region.replace(/ /g, "_").replace(/&/g, "_"))
            .attr('d', d => line(d.values))
            .style('stroke', (d, i) => color(i))
            .style('opacity', lineOpacity)
            .on("mouseover", function(d) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text()
                var selected = d3.select('#visual7-dropdown').property('value')
                if (regions.indexOf(selected_init) != -1 && lock ==1){                 
                    d3.selectAll("#visual7 ."+selected)
                        .style('opacity', otherLinesOpacityHoverRegion)
                        .style("stroke-width", lineStrokeHover)
                            
                    d3.selectAll("#visual7 .c"+selected).style('opacity', otherLinesOpacityHoverRegion)
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .style('stroke-width', "3.5")
                        .style('opacity', 1)
    
                    d3.selectAll("#visual7 #c"+this.id).style('opacity', 1)
                }	
                if (lock == 0 || (d.name == selected_init)){onchange(this.id, "all", null)}
                if (regions.indexOf(selected_init) != -1) {onchangeinregion(this.id, "all", null)}
            })
            .on("click", clicked)
					
        function clicked() {
            if (lock == 0) {
                lock = 1;
                d3.select("#visual7-lockCheckbox").property('checked', true);
            } else {
                lock = 0;
                d3.select("#visual7-lockCheckbox").property('checked', false);
            }
            onlockChange()
        }
			
        var circles = svg.append('g').attr('class', 'circles');
        circles
            .selectAll("#visual7 .circle-group")
            .data(data).enter()
            .append("g")
            .attr('class', 'circle-group')
            .attr('id', d => d.name.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_"))
            .style("fill", (d, i) => color(i))
            .selectAll("#visual7 circle")
            .data(d => d.values).enter()
            .append("g")
            .attr("class", "circle")
            .style("cursor", "pointer")
            .on("mouseover", function(d) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text()
                if (lock == 0 || (d.name == selected_init) || (regions.indexOf(selected_init) != -1)){
                    d3.select(this) 
                        .append("text")
                        .attr("class", "text")
                        .text(`${d[form_val]}`)
                        .attr("x", d => xScale(d.date) + 5)
                        .attr("y", d => yScale(d[form_val]) - 10);
                                
                    svg.select("#visual7 .title-text").remove();
                    svg.append("text")
                    .attr("class", "title-text")
                    .style("font-size", "18px")
                    .style("fill", "black")
                    .text(d.name + " | Year: " + d.date +" | Themes ("+ d[form_val] +")"+" | Records ("+ d.record +")")
                    .attr("text-anchor", "middle")
                    .attr("x", (visual7Width-marginH)/2)
                    .attr("y", 5);
                }
            })
            .on("mouseout", function(d) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text()
                if (lock == 0 || (d.name == selected_init) || (regions.indexOf(selected_init) != -1)){
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .selectAll("#visual7 .text").remove();
                }
            })
            .append("circle")
            .attr("class",d=> "c"+d.region.replace(/ /g, "_").replace(/&/g, "_"))
            .attr("id", d=> "c"+d.name.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_"))
            .attr("year", d=> d.date)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d[form_val]))
            .attr("r", circleRadius)
            .style('opacity', circleOpacity)
            .on("mouseover", function(d) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text()
                var selected = d3.select('#visual7-dropdown').property('value')
                if (regions.indexOf(selected_init) != -1 && lock ==1){
                    d3.selectAll("#visual7 ."+selected)
                        .style('opacity', otherLinesOpacityHoverRegion)
                        .style("stroke-width", lineStrokeHover)
                        
                    d3.selectAll("#visual7 .c"+selected).style('opacity', otherLinesOpacityHoverRegion)
                
                    d3.select("#visual7 #"+this.id.slice(1))
                        .transition()
                        .duration(duration)
                        .style('stroke-width', "3.5")
                        .style('opacity', 1)
                        
                    d3.selectAll("#visual7 #c"+this.id.slice(1)).style('opacity', 1)
                }
						
                if (lock == 0 || (d.name == selected_init) || (regions.indexOf(selected_init) != -1)){
                    if (regions.indexOf(selected_init) === -1) {onchange(this.id.slice(1), d.date, null)}
                    if (regions.indexOf(selected_init) != -1) {onchangeinregion(this.id.slice(1), d.date, null)}
                    d3.select(this)
                      .transition()
                      .duration(duration)
                      .attr("r", circleRadiusHover);
                }
            })
            .on("mouseout", function(d) {
                var selected_init = d3.select('#visual7-dropdown option:checked').text();
                d3.select(this) 
                .transition()
                .duration(duration)
                .attr("r", circleRadius);  
            })
            .on("click", clicked)
            
        var xAxis = d3.axisBottom(xScale).ticks(xTick).tickFormat(d3.format(".0f"));
        var yAxis = d3.axisLeft(yScale).ticks(yTick).tickFormat(d3.format(".0f"));
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${visual7Height-marginV})`)
            .call(xAxis)
            .append('text')
            .attr("x", visual7Width-marginH-15)
            .attr("y", -5)
            .attr("transform", "rotate(0)")
            .attr("fill", "#000")
            .text("Years");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append('text')
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .text("Total themes");
                    
            
        /////////////////////////////////////////// PIE CHART ///////////////////////////////////////////
        var colorChart = d3.scaleOrdinal()
            // .range(["#0000FF", "#FF4500", "#008000", "#e823d1", "#696969"]);	
			.range(["#3f51b5", "#d81b60", "#4caf50", "#964b00", "#000000"]);
                    
        // create svg for pie chart.
        var piesvg = 
            d3.select("#visual7-pieChart")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 "+(pieDim.w * 1.5)+" "+(pieDim.h))
                .classed("svg-content", true)
                // .attr("width",pieDim.w)
                // .attr("height", pieDim.h)
                    
        // create function to draw the arcs of the pie slices.
        var arc = d3.arc().outerRadius(pieDim.r).innerRadius(pieDim.r/2);

        // create a function to compute the pie slice angles.
        var pie = 
            d3.pie().sort(null).value(function(d) {
                return d.value[form_val]; 
            });

        var pieg = piesvg.append("g")
                .attr("transform", "translate("+pieDim.w/2+","+(pieDim.h/4 + 25)+")")
                .attr("id", "pie")
            
        pieg.selectAll("#visual7 path")
            .data(pie(pD))
            .enter()
            .append("path")
            .attr("class", function(d) { return d.data.key; })
            .attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return colorChart(d.data.key); })

        pieg.selectAll("#visual7 .pieText")
            .data(pie(pD))
            .enter().append("text")
            .attr("class", "pieText")
            .attr("transform", d=> "translate(" + arc.centroid(d) + ")") 
            .attr('dy', "0.3em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text(function(d) {return d.data.value[form_val]; });

        /////////////////////////////////////////// UPDATE PIE CHART///////////////////////////////////////////
        function pieUpdate(nD,single){
            pieg.selectAll("#visual7 path")
                .data(pie(nD))
                .transition()
                .duration(700)
                .attrTween("d", arcTween);
                    
            pieg.selectAll("#visual7 .pieText").data(pie(nD)).transition().duration(700)
                .attr("transform", d=> (single == 1) ? "translate("+0+","+0+")" : "translate(" + arc.centroid(d) + ")")
                .attr("opacity", d=> (d.data.value[form_val] == 0) ? 0 : 1)
                .text(function(d) { return d.data.value[form_val]; });
                    
            // Animating the pie-slice requiring a custom function which specifies
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) { 
                    return arc(i(t));   
                };
            } 
        }
			
        ///////////////////////////////////////////TYPE LEGENDS///////////////////////////////////////////
        var typeg = 
            piesvg.append("g")
                    .attr("id", "typeBars")
                    .attr("transform", "translate("+pieDim.w/2+","+(pieDim.h/2 + 50)+")")
                
        typeg.selectAll("#visual7 rect")
            .data(type).enter().append("rect")
            .attr("id", d => d)
            .attr('x', (d,i)=> -70)
            .attr('y', (d,i)=> (i*25) + 25)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d=> colorChart(d))
            .transition()
            .ease(d3.easeLinear)
            .delay(0)
            .duration(700);
                
        typeg.selectAll('#visual7 .title')
            .data(type)
            .enter()
            .append('text')
            .attr('class', 'title')
            .attr("text-anchor", "start")
            .attr("font-family", "sans-serif")
            .attr('x', (d,i)=> -40)
            .attr('y', (d,i)=> (i*25) + 38.5)
            .text(d=>d)
            .style('opacity', 0.0)
            .transition()
            .ease(d3.easeLinear)
            .delay(500)
            .duration(700)
            .style('opacity', 1.0)
                    
        /////////////////////////////////////////// DROPDOWN ///////////////////////////////////////////
        var selector = 
            d3.select("#visual7_dropdown")
                .append("select")
                .attr("id","visual7-dropdown")
                .style("width","100%")
                .style("border", "1px solid #ccc")
                .style("padding", "7px")
                .style("margin-bottom", "15px")
                .on("change", function(d) {
                    var selected_init = d3.select('#visual7-dropdown option:checked').text() 
                    var selected = d3.select('#visual7-dropdown').property('value')
                    svg.select("#visual7 .title-text").remove();
                    if (selected_init == Global) {
                        var total = sota.length	
                        var record = d3.map(sota,d=> d.issf_core_id).keys().length
                    } else if (regions.indexOf(selected_init) != -1){
                        var total = data_sota_region[selected_init].total
                        var record = data_sota_region[selected_init].record
                    }
                    else {
                        var total = d3.sum(data.filter(d=>d.name == selected_init)[0].values, v=> v[form_val])
                        var record = d3.sum(data.filter(d=>d.name == selected_init)[0].values, v=> v.record)
                    }
                    svg.append("text")
                        .attr("class", "title-text")
                        .style("font-size", "18px")
                        .style("fill", "black")
                        .text(selected_init + " | Themes ("+ total +")"+ " | Records ("+ record +")")
                        .attr("text-anchor", "middle")
                        .attr("x", (visual7Width-marginH)/2)
                        .attr("y", 20);
                        
                    onlockChange();
                    onchange(selected, "all", selected_init);
                })
						
        function onchangeinregion(selected, year, selected_init) {
            if (year == "all") {
                var sotaFiltered = sota.filter(c => c.country.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_") == selected)
            } else {
                var sotaFiltered = sota.filter(c => c.year == year && c.country.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_") == selected)
            }
            var nD = 
                d3.nest()
                    .key(function(d) { return d.theme_issue_category}).sortKeys(d3.ascending)
                    .rollup(function(v) { 
                        return {
                        total: v.length
                    };
                })
                .entries(sotaFiltered);
                        
            nD.forEach(function(d){
                var sota_filtered = sota.filter(m => (m.theme_issue_category == d.key && m.country == selected_init))
                var count_issf = d3.map(sota_filtered, d => d.issf_core_id).keys().length
                d.value.record = count_issf
            })
            
            var type_current = d3.map(nD, d => d.key).keys()
            var single = type_current.length
                        
            //Adding nonExist Types to Country
            for(var j =0;j<type.length;j++){
                if (type_current.indexOf(type[j]) === -1){
                    nD.push({key : type[j], value: {total :0, record:0}}); 
                }
            }

            nD.sort(d3.ascending);
            pieUpdate(nD,single)
        }
					
                
        function onchange(selected, year, selected_init) {
            if (selected == Global.replace(/ /g, "_")) {
                d3.selectAll('#visual7 .line').style('opacity', lineOpacity);
                d3.selectAll('#visual7 circle').style('opacity', circleOpacity);
                pieUpdate(pD,4)
            } else if (regions.indexOf(selected_init) != -1) {
                d3.selectAll('#visual7 .line')
                    .style('opacity', otherLinesOpacityHover)
                    .style("stroke-width", lineStroke)
                d3.selectAll('#visual7 circle').style('opacity', circleOpacityOnLineHover)
                d3.selectAll("#visual7 ."+selected)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                d3.selectAll("#visual7 .c"+selected).style('opacity', 1)
                var sotaFiltered = sota.filter(c => c.region == selected_init)
                var nD = 
                    d3.nest()
                        .key(function(d) { return d.theme_issue_category}).sortKeys(d3.ascending)
                        .rollup(function(v) { 
                            return {
                            total: v.length
                        };
                        })
                    .entries(sotaFiltered);
                
                nD.forEach(function(d){
                    var sota_filtered = sota.filter(m => (m.theme_issue_category == d.key && m.region == selected_init))
                    var count_issf = d3.map(sota_filtered, d => d.issf_core_id).keys().length
                    d.value.record = count_issf
                })
                    
                var type_current = d3.map(nD, d => d.key).keys()
                var single = type_current.length
                        
                //Adding nonExist Types to Country
                for(var j =0;j<type.length;j++){
                    if (type_current.indexOf(type[j]) === -1){
                        nD.push({key : type[j], value: {total :0, record:0}}); 
                    }
                }

                nD.sort(d3.ascending);
                pieUpdate(nD,single)
            }
            else {	
                d3.select('#visual7-dropdown').property('value', selected)
                d3.selectAll('#visual7 .line')
                    .style('opacity', otherLinesOpacityHover)
                    .style("stroke-width", lineStroke)
                        
                d3.selectAll('#visual7 circle')
                    .style('opacity', circleOpacityOnLineHover)
                    
                d3.select("#visual7 #"+selected)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                        
                d3.selectAll("#visual7 #c"+selected).style('opacity', 1)
                    
                if (year == "all") {
                    var sotaFiltered = sota.filter(c => c.country.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_") == selected)
                } else {
                    var sotaFiltered = sota.filter(c => c.year == year && c.country.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/\./g, "_") == selected)
                }
                    
                var nD = 
                    d3.nest()
                        .key(function(d) { return d.theme_issue_category}).sortKeys(d3.ascending)
                        .rollup(function(v) { 
                            return {
                                total: v.length
                        }; 
                    })
                    .entries(sotaFiltered);
                        
                nD.forEach(function(d){
                    var sota_filtered = sota.filter(m => (m.theme_issue_category == d.key && m.country == selected_init))
                    var count_issf = d3.map(sota_filtered, d => d.issf_core_id).keys().length
                    d.value.record = count_issf
                })
                    
                var type_current = d3.map(nD, d => d.key).keys()
                var single = type_current.length
                        
                //Adding nonExist Types to Country
                for(var j =0;j<type.length;j++){
                    if (type_current.indexOf(type[j]) === -1){
                        nD.push({key : type[j], value: {total :0, record:0}}); 
                    }
                }

                nD.sort(d3.ascending);
                pieUpdate(nD,single)
            }
        }
            
        selector 
            .append("optgroup")
            .attr("label", "Global")
            .attr("value", "Global")
            .append("option")
            .attr("value", function(d){
                return Global.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/&/g, "_").replace(/\./g, "_");
            })
            .text(function(d){
                return Global;
            })
					
        selector
            .append("optgroup")
            .attr("label", "Regions")
            .attr("value", "Regions")
            .selectAll("#visual7 option")
            .data(regions)
            .enter()
            .append("option")
            .attr("value", function(d){
                return d.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/&/g, "_").replace(/\./g, "_");
            })
            .text(function(d){
                return d;
            })

        selector
            .append("optgroup")
            .attr("label", "Countries")
            .attr("value", "Countries")
            .selectAll("#visual7 option")
            .data(uniqueCountryArray)
            .enter()
            .append("option")
            .attr("value", function(d){
                return d.replace(/ /g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/'/g, "_").replace(/&/g, "_").replace(/\./g, "_");
            })
            .text(function(d){
                return d;
            })
            
                    
        /////////////////////////////////////////// lockCheckbox ///////////////////////////////////////////
        d3.select("#visual7-lockCheckbox").on("change", onlockChange)
			
        function onlockChange(){
            var selected = d3.select('#visual7-dropdown').property('value')
            var selected_init = d3.select('#visual7-dropdown option:checked').text()
            lock = 0
            if (d3.select("#visual7-lockCheckbox").property("checked")){
                lock = 1
                d3.selectAll('#visual7 .line').style("pointer-events", "none")
                d3.selectAll('#visual7 circle').style("pointer-events", "none")
                
                if (regions.indexOf(selected_init) != -1){
                    d3.selectAll("#visual7 ."+selected).style("pointer-events", "");
                    d3.selectAll("#visual7 .c"+selected).style("pointer-events", "")
                } else{		
                    d3.select("#visual7 #"+selected).style("pointer-events", "");
                    d3.selectAll("#visual7 #c"+selected).style("pointer-events", "")
                }
            } else {
                d3.selectAll('#visual7 .line').style("pointer-events", "")
                d3.selectAll('#visual7 circle').style("pointer-events", "")
            }				
        };
        onlockChange()
    }
}