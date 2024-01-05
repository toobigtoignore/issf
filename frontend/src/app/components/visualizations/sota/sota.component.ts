import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';


@Component({
    selector: 'app-sota',
    templateUrl: './sota.component.html',
    styleUrls: ['./sota.component.css'],
    encapsulation: ViewEncapsulation.None
})


export class SotaComponent implements OnInit {
    @Input() data : any


    constructor() { }

    
    ngOnInit(): void {
        this.drawConsole(this.data)
    }

    
    private drawConsole(data): void {
        var data_nested,new_country,value;
        var Global = "Global Data";
        var tickDuration = 2000;
        var init = 0;
        var clear = false;
        let year = 2000;
        var lastYear = 2020;
        var rangeYear = lastYear - year;
		var top_n = 12;
		var height = 490;
		var width = 890;
		const margin = {
		    top: 40,
		    right: 200,
		    bottom: 0,
		    left: 20
		};
        var svg = 
            d3.select("#barSvg")
			  .attr("preserveAspectRatio", "xMinYMin meet")
			  .attr("viewBox", "0 0 "+(width)+" "+(height))
			  .classed("svg-content", true)
			  .append("g")

        var legendDiv = 
            svg.append("foreignObject")
               .attr("x", width/2-50)
               .attr("y", (height-85)+'px')
               .attr("width", 100)
               .attr("height", 100)
               .append("xhtml:div")
               .attr("class", "playpause")
               .append("div")
               .attr('id','buttonDiv')
               .attr('class','buttonDiv')
	
		
	    // Button
        var buttonDiv = 
            legendDiv.append("div")
                    .attr('id','buttonDiv')
                    .attr('class','buttonDiv')
                    .attr('align','center');

        var button = buttonDiv.append("button").attr("class", "button");
		
	    // Info
        let subTitle = 
             svg.append("text")
		        .attr("class", "title")
		        .attr('x', width - margin.right - 60)
		        .attr("y", margin.top - 20)
		        .html("Country | # Issues | # Records");

	    // READING CSV
		var data = data.filter(d => (d.year != "1973" && d.category != "" && d.country != "0"));
		var country = d3.map(data, d => d.country).keys();
        country.push(Global);
        var category = d3.map(data, d => d.category).keys();
            
        
	    //  DATA MANIPULATION
		var total = {} 
		var totalStd = {} 
		var totalCategory = {}
		var totalRecord = {}
		var totalStdCategory = {}
		country.forEach(function (d) {
		    total[d] = 0
			totalStd[d] = 0
			totalCategory[d] = []
			totalRecord[d] = 0
			totalStdCategory[d] = []
			
			category.forEach(function (cat) {
				totalCategory[d][cat] = 0
				totalStdCategory[d][cat] = 0
			});
		});
        
        
		//Grouping by year and country
        data_nested = 
            d3.nest()
              .key(function(d) { return d.year; })
              .sortKeys(d3.ascending)
			  .key(function(d) { return d.country; })
			  .rollup(function(v) { 
                    return {
                        length: v.length
                    }; 
                })
			  .entries(data);
		
		var new_data = []
		var i = 0
		data_nested.forEach(function (d) {
			//Add All country to each year array
			new_country = d3.map(d.values, v => v.key).keys()
			var sum = d3.sum(d.values, v=> v.value.length)
			country.forEach(function (c) {
				if(new_country.indexOf(c)===-1){
					if (c === Global){
						d.values.push({key: c, value: {length: sum}})
					} else{
						d.values.push({key: c, value: {length: 0}})
					}
				}
			});
			
            var data_year_filtered = data.filter(m => (m.year == d.key));
            //Create new array
            d.values.forEach(function (v) {
                //Find Standardized count
                if (v.key == Global) {
                    var data_country_filtered = data_year_filtered;
                } else {
                    var data_country_filtered = data_year_filtered.filter(m => (m.country == v.key));
                }
                var count_issf = d3.map(data_country_filtered, function(c){return c.issf_core_id;}).keys().length;
                totalRecord[v.key] = totalRecord[v.key] + count_issf;
                if (count_issf == 0) {
                    totalStd[v.key] = totalStd[v.key] + 0;
                } else {
                    totalStd[v.key] = totalStd[v.key] + v.value.length/count_issf;
                }
                total[v.key] = total[v.key] + v.value.length;
                new_data.push({year: d.key, name: v.key, value: total[v.key], std: totalStd[v.key], totalRecord : totalRecord[v.key], stdCat : [], length: v.value.length,  rank: 0})
                category.forEach(function (cat) {
                    var catLength = data_country_filtered.filter(m => (m.category == cat)).length
                    totalCategory[v.key][cat] = totalCategory[v.key][cat] + catLength
                    new_data[i][cat] = totalCategory[v.key][cat]
                });
                i = i + 1
            });
	    });

		data = new_data;
		data.forEach(d => {
			d.value = +d.value,
			d.std = +d.std,
			d.value = isNaN(d.value) ? 0 : d.value,
			d.year = +d.year
		});

	    // Legend
		var z = d3.scaleOrdinal(["#ffca3a","#8ac926","#1982c4","#6a4c93"]); 
		var legsize = 20;
        var legendCat = 
            svg.selectAll(".legend")
                .data(category)
                .enter()
                .append("g");

        legendCat
            .append("rect")
            .attr("fill", function (d) {
                return z(d);
            })
            .attr("width", legsize)
            .attr("height", legsize)
            .attr("x", function (d, i) {
                return width-margin.right;
            })
            .attr("y", function (d, i) {
                return height/2+i*30;
            });

        legendCat
            .append("text")
            .attr("class", "labelCat")
            .attr("x", function (d, i) {
                return width-margin.right+legsize+5;
			})
            .attr("y", function (d, i) {
                return height/2+i*30+legsize/2+3;
            })
            .attr("text-anchor", "start")
            .text(function (d, i) {
                return category[i];
            });


	    // INITIAL CHART
        var yearSlice = []
        if (d3.select("#sort").property("checked")) {
            value = "std"
        } else {
            value = "value"
        }
		  
        //  Checkbox
		d3.select("#selectedCountries").on("change",update_checkbox);
        function update_checkbox() {
            if (d3.select("#selectedCountries").property("checked")) {
                d3.select("#dropDiv").classed("hidden", false);
            } else {
                d3.select("#dropDiv").classed("hidden", true)
            }
        }
        update_checkbox()

        //  DROPDOWN 
        yearSlice = 
            data.filter(d => d.year == year && !isNaN(d[value]) && d.name != Global)
				.sort((a,b) => b[value] - a[value]);
			
		country = yearSlice.map(d => d.name);
		var countryAlph = yearSlice.map(d => d.name).sort(d3.ascending)
		var dropDiv = d3.select("#dropDiv")
		var selectedCountries = []
		for(var i=0; i<top_n; i++) {
            var selector = dropDiv.append("select").attr("id","dropdown"+i)
            if (i==0) {
                var firstRows = [" ", Global]
            } else {
                var firstRows = [" "]
            }
            selector
                .selectAll("option")
                .data(firstRows)
                .enter()
                .append("option")
                .attr("value", function(d) {
					return d;
				})
				.text(function(d){
					return d;
				})
						
            selector
                .selectAll("option")
                .data(countryAlph)
                .enter()
                .append("option")
                .attr("value", function(d) {
                    return d;
                })
                .text(function(d){
                    return d;
                })

            selector.property('value',country[i])
		}
        dropDiv.append("br");
        dropDiv.append("br");
			
		// Top / Clear Buttons
		var yearSliceReal = yearSlice.slice(0,top_n);
        dropDiv
            .append("button")
            .attr("class", "myButton")
            .text("Top "+top_n)
            .on("click", function() {
                var i = 0
                d3.selectAll("select").property('value',' ')
                yearSliceReal.forEach(function (n) {
                    d3.select("#dropdown"+i).property("value", n.name);
                    i = i + 1;
                })
				if (!moving) {
					movingStart()
				}
			})
					  
		dropDiv
            .append("button")
            .attr("class", "myButton")
            .text("Clear")
            .on("click", function() {
                d3.selectAll("select").property('value',' ');
                movingStop();
                clear = true;
                if (init == 0) {
                    update(xx.invert(currentValue))
                } else {
                    update(xx.invert(currentValue)-1)
                }
            })
				
		if (d3.select("#selectedCountries").property("checked")){
			selectedCountries = []
            for(var i=0; i<top_n; i++) {
                selectedCountries.push(d3.select("#dropdown"+i).property("value"))
            }
            yearSlice = 
                data.filter(d => d.year == year && !isNaN(d[value]) && !(selectedCountries.indexOf(d.name)===-1))
                    .sort((a,b) => b[value] - a[value])
                    .slice(0,top_n);
		} else {
            yearSlice = 
                data.filter(d => d.year == year && !isNaN(d[value]) && d.name != Global)
                    .sort((a,b) => b[value] - a[value])
                    .slice(0,top_n);
		}
        yearSlice.forEach((d,i) => d.rank = i);
        var ySt = d3.scaleBand().range([height-margin.bottom, margin.top]);
        ySt.domain(yearSlice.map(d => d.name)).padding(0.1)	  
	 
        let x = 
            d3.scaleLinear()
                .domain([0, d3.max(yearSlice, d => d[value])])
                .range([margin.left, width-margin.right]);
    
        let y = 
            d3.scaleLinear()
                .domain([top_n, 0])
                .range([height-margin.bottom, margin.top]);
    
        let xAxis = 
            d3.axisTop()
                .scale(x)
                .ticks(width > 500 ? 5:2)
                .tickSize(-(height-margin.top-margin.bottom))
                .tickFormat(d => d);
    
        svg
            .append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);
        
        //  Stacked Bars
        var group = 
            svg.selectAll("g.layer")
			   .data(d3.stack().keys(category)(yearSlice), d => d.key);

        group.exit().remove();
        group
            .enter()
            .append("g")
			.classed("layer", true)
			.attr("id", d => d.key)
			.attr("fill", d => z(d.key));
				
        var bars = 
            svg.selectAll("g.layer")
                .selectAll("rect")
				.data(d => d, e => e.data.name)
				
		bars.exit().remove()
        bars
            .enter()
            .append("rect")
            .attr("id", d => d.data.name)
            .attr("height", ySt.bandwidth())
            .merge(bars)
            .attr("x", d => x(d[0]))
			.attr('y', d => y(d.data.rank)+5)
			.attr("width", d => x(d[1]) - x(d[0]))
                    
            
		//  Bars Labels
		svg.selectAll('text.valueLabel')
		    .data(yearSlice, d => d.name)
		    .enter()
		    .append('text')
		    .attr('class', 'label')
			.attr('x', d => x(d[value])+5)
		    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
		    .text(d => d.name + " | " + d[value] + " | " + d.totalRecord); 

        let yearText = 
            svg.append('text')
		       .attr('class', 'yearText')
               .attr('x', width-margin.right)
               .attr('y', height-50)
               .style('text-anchor', 'end')
               .html(~~year);
          
               
        //  SLIDER
		var startDate = year;
		var endDate = lastYear;
		var marginSlider = {top:40, right:50, bottom:0, left:30},
			widthSlider = width - marginSlider.left - marginSlider.right,
			heightSlider = 60 - marginSlider.top - marginSlider.bottom;

        var svgSlider = 
            d3.select("#sliderSvg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 "+(widthSlider + marginSlider.left + marginSlider.right)+" "+(heightSlider + marginSlider.top + marginSlider.bottom))
              .classed("svg-content", true);
		
		var moving = false;
		var currentValue = 0;
		var targetValue = widthSlider;
		var playPause = d3.selectAll(".playpause")
		var playButton = d3.select(".button");
		playPause.on("click", function() {
			if (playButton.classed("paused")) {movingStop()}else{movingStart()}
		});
        var timer;

		function movingStart() {
			playButton.classed("paused", true)
            moving = true;
            if (init == 1) {
                currentValue = currentValue - (targetValue/rangeYear);
            } else {
                currentValue = currentValue + (targetValue/rangeYear);
            }
            step();
            timer = setInterval(step, tickDuration);
            init = 1;
		}
        
        
		function movingStop() {
            playButton.classed("paused", false);
            moving = false;
            if (init == 1) { 
                clearInterval(timer);
            }
		}
		
        
        var xx = 
            d3.scaleLinear()
			  .domain([startDate, endDate])
			  .range([0, targetValue])
			  .clamp(true);
			
        var slider = 
            svgSlider.append("g")
			         .attr("class", "slider")
			         .attr("transform", "translate(" + marginSlider.left + "," + heightSlider + ")");

        slider
            .append("line")
			.attr("class", "track")
			.attr("transform", "translate(0," + 15 + ")")
			.attr("x1", xx.range()[0])
			.attr("x2", xx.range()[1])
		    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "track-inset")
		    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "track-overlay")
			.call(d3.drag()
				.on("start.interrupt", function() { slider.interrupt(); })
				.on("start drag", function() {
				    currentValue = d3.event.x;
				    update(xx.invert(currentValue)); 
				})
			);

        
        slider
            .insert("g", ".track-overlay")
			.attr("class", "ticks")
			.attr("transform", "translate(0," + 30 + ")")
		    .selectAll("text")
			.data(xx.ticks(rangeYear))
			.enter()
			.append("text")
			.attr("x", xx)
			.attr("y", 10)
			.attr("text-anchor", "middle")
			.text(function(d) { return d; });

        var handle = 
            slider.insert("circle", ".track-overlay")
			      .attr("transform", "translate(0," + 15 + ")")
			      .attr("class", "handle")
			      .attr("r", 9);

        var label = 
            slider.append("text")  
			      .attr("class", "label")
			      .attr("text-anchor", "middle")
			      .text(startDate)
			      .attr("transform", "translate(0," + 0 + ")")


		function step() {
            update(xx.invert(currentValue));
            if (Math.round(xx.invert(currentValue)) >= lastYear) {
			    moving = false;
			    currentValue = 0;
			    clearInterval(timer);
			    d3.select(".button").classed("paused", false);
		    } else {
			    currentValue = currentValue + (targetValue/rangeYear);
			}
		}
		
		
	    //  UPDATE
		function update(h) {
			var a = 0;
			for(var i=0; i<top_n; i++){
				if (d3.select("#dropdown"+i).property("value") !== " ") {a = 1}
			}
			if (a == 0) { movingStop() }
			if (a == a) { 
				clear = false
				h = d3.format(".0f")(h)
				handle.attr("cx", xx(h));
				label.attr("x", xx(h)).text(h);
				year = h;
				if (d3.select("#sort").property("checked")){
					value = "std"
				} else {
				    value = "value"
				}  
                yearSliceReal = 
                    data.filter(d => d.year == year && !isNaN(d[value]) && d.name != Global)
					    .sort((a,b) => b[value] - a[value])
					    .slice(0,top_n);

				if (d3.select("#selectedCountries").property("checked")) {
					selectedCountries = []
                    for(var i=0; i<top_n; i++){
                        selectedCountries.push(d3.select("#dropdown"+i).property("value"))
                    }
                    yearSlice = 
                        data.filter(d => d.year == year && !isNaN(d[value]) && !(selectedCountries.indexOf(d.name)===-1))
						    .sort((a,b) => b[value] - a[value])
						    .slice(0,top_n);
				} else {
                  yearSlice = 
                    data.filter(d => d.year == year && !isNaN(d[value]) && d.name != Global)
					    .sort((a,b) => b[value] - a[value])
					    .slice(0,top_n);
				}

			    yearSlice.forEach((d,i) => d.rank = i);

			    x.domain([0, d3.max(yearSlice, d => d[value])]); 

                svg.select('.xAxis')
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .call(xAxis);
                    
                var group = svg.selectAll("g.layer")
                        .data(d3.stack().keys(category)(yearSlice), d => d.key);
                        
				group.exit().remove();
				group.enter().append("g")
					.classed("layer", true)
					.attr("id", "d => d.key")
					.attr("fill", d => z(d.key));
					
			    var bars = svg.selectAll("g.layer").selectAll("rect").data(d => d, e => e.data.name);
		
                bars //adding
                    .enter()
                    .append('rect')
                    .attr("id", d => d.data.name)
                    .attr("height", ySt.bandwidth())
                    .attr("x", d => x(d[0]))
                    .attr('y', d => y(top_n+1)+5)
                    .attr("width", d => x(d[1]) - x(d[0]))
                    .merge(bars)
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attr('y', d => y(d.data.rank)+5);
                
    		    bars //changing
			        .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attr("x", d => x(d[0]))
			        .attr("width", d => x(d[1]) - x(d[0]))
			        .attr('y', d => y(d.data.rank)+5);
				
		        bars  //removing
			        .exit()
			        .transition()
			        .duration(tickDuration)
			        .ease(d3.easeLinear)
			        .attr('y', d => y(top_n+1)+5)
			        .remove();
			 
		        let valueLabels = svg.selectAll('.label').data(yearSlice, d => d.name);
		
		        valueLabels
			        .enter()
			        .append('text')
			        .attr('class', 'label')
			        .attr('x', d => x(d[value])+5)
			        .attr('y', d => y(top_n+1)+5)
			        .text(d => d.name + " | " + d[value] + " | " + d.totalRecord)
			        .transition()
				    .duration(tickDuration)
				    .ease(d3.easeLinear)
				    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
				
		        valueLabels
			        .transition()
				    .duration(tickDuration)
				    .ease(d3.easeLinear)
				    .attr('x', d => x(d[value])+5)
				    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
				    .tween("text", function(d) {
					    var node = this;
					    var text = node.textContent.split( ' | ' );
				        let i = d3.interpolateRound(text[1], d[value]);
				        let j = d3.interpolateRound(text[2], d.totalRecord);
				        return function(t) {
					        node.textContent = text[0] + " | " + i(t) + " | " + j(t); //d3.format(',')(i(t))
				        };
				    });
                
                valueLabels
			        .exit()
			        .transition()
			        .duration(tickDuration)
			        .ease(d3.easeLinear)
			        .attr('y', d => y(top_n+1)+5)
			        .remove();
		
		        yearText.html(~~year);
	        }
	    }
    }
}