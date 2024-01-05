import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';


@Component({
    selector: 'app-gear-vessel',
    templateUrl: './gear-vessel.component.html',
    styleUrls: ['./gear-vessel.component.css'],
    encapsulation:ViewEncapsulation.None
})


export class GearVesselComponent implements OnInit {

    @Input() data : any

    
    constructor() { }
  
    
    ngOnInit(): void {
	    this.drawConsole(this.data)
	}
  

    private drawConsole(data): void {
        var selected_button,data_count,data_gear,selection_new,selected_tab,data_other,new_data_nested
        var margin = {top: 20, right: 10, bottom: 150, left: 0, space : 2},
        width = 660 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
                
        var svg = 
            d3.select(".svgdiv")
              .append("svg")
              .attr("class", "svgmap")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 " + width + " " + height)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .style("max-width",width);


        var underConstr = 
            svg.append("g")
               .attr("class", "under hidden")
               .attr("transform", "translate(100,100)");
                
        underConstr.append("text").text("Under Construction :)");

        
        //Read data by Gear or Vessel
        var data = data.filter(function(d){return d.attribute_value__value_label != '';});
        var main_gear = data.filter(function(d){return d.attribute__attribute_label == 'Main gear type(s):';});
        var main_vessel = data.filter(function(d){return d.attribute__attribute_label == 'Main SSF vessel type(s):';});


        //Get Types for Gear
        var regions_array = data.map(function(x) { return x.region; }); 
        regions_array = regions_array.filter(function(elem, pos) {
            return regions_array.indexOf(elem) == pos;
        });

        
        //Get Types for Gear
        var types_gear = main_gear.map(function(x) { return x.attribute_value__value_label; }); 
        types_gear = types_gear.filter(function(elem, pos) {
            return types_gear.indexOf(elem) == pos;
        });

        
        //Get Types for Vessel
        var types_vessel = main_vessel.map(function(x) { return x.attribute_value__value_label; }); 
        types_vessel = types_vessel.filter(function(elem, pos) {
            return types_vessel.indexOf(elem) == pos;
        });

        
        //Draw Bar Chart
        function drawGraph(main, drop_selected, types, regionOrCountry) {
            var dG = { update: null };
            //Groupping data by type for average  /////////old calc
            data_count = 
                d3.nest()
                  .key(function(d) { return d.attribute_value__value_label; })
                  .rollup(function(v) { return { 
                      length: v.length 
                    }; 
                })
                .entries(main);
                
            
            //Groupping data //cal 1 ok
            data_gear = 
                d3.nest()
                  .key(function(d) { return d.country})
                  .key(function(d) { return d.attribute_value__value_label; })
                  .rollup(function(v) { return {
                      length: v.length
                    }; 
                })
                .entries(main);
                
            
            //Sum of country labels //calc 2
            data_gear.forEach(function (d) {
                if (regionOrCountry == "region"){
                    var region = main.filter(function(m){return m.country == d.key;}).map(function(r) { return r.region; });  //main.map(function(x) { return x.region; }); 
                    d.region = region[0]
                }
                
                //Groupping data by type for average  /////////old calc
                data_other = 
                    d3.nest()
                      .key(function(d) { return d.issf_core_id;})
                      .rollup(function(v) { return {
                          length: v.length
                        }; 
                    })
                    .entries(main.filter(function(m){return m.country == d.key && m.attribute_value__value_label == "Other";}));
                
                
                var records = d3.sum(data_other,function(v){return v.value.length;}) - data_other.length;
                var data_issf = d3.map(main.filter(function(m){return m.country == d.key;}), function(m){return m.issf_core_id;}).keys();
                d.total = d3.sum(d.values,function(v){return v.value.length;});
                d.records = records + data_issf.length;
            })	
                
            
            //add new length and sum of types ///calc 3 & 4
            data_gear.forEach(function (d) {
                d.values.forEach(function (v) {
                        v.value.std = +d3.format(".5f")((v.value.length/d.records*100))
                        v.value.perc = +d3.format(".5f")((v.value.length/d.total))
                });
            });

            
            if (regionOrCountry == "region"){ 
                var new_data = [];
                data_gear.forEach(function (d) {
                    d.values.forEach(function (v) {
                        new_data.push({region: d.region, type: v.key, length: v.value.length})
                    });
                });
                
                
                //Groupping data by type for average 
                new_data_nested = 
                    d3.nest()
                      .key(function(d) { return d.region; })
                      .key(function(d) { return d.type; })
                      .rollup(function(v) { return {
                        length: d3.sum(v, function(d) { return d.length; })
                      }; 
                    })
                    .entries(new_data);
                    
                new_data_nested.forEach(function (d) {
                    d.total = d3.sum(d.values,function(v){return v.value.length;})
                    d.records = d3.sum(data_gear.filter(function(m){return m.region == d.key;}),function(v){return v.records;})
                });	  
                
                new_data_nested.forEach(function (d) {
                    d.values.forEach(function (v) {
                        v.value.std = +d3.format(".5f")((v.value.length/d.records*100))
                        v.value.perc = +d3.format(".5f")((v.value.length/d.total))
                    });
                });

                data_gear = new_data_nested;
            }

            var format_scale = 
                d3.scaleOrdinal()
                  .domain(["std","perc"])
                  .range([".2f",".2%"]);
            
            var format_scale_yAxis = 
                d3.scaleOrdinal()
                  .domain(["std","perc"])
                  .range([".0f",".0%"]); 
            
            //Set Axis
            var x0 = 
                d3.scaleBand()
                  .domain(types)
                  .rangeRound([0, width])
                  .paddingInner(0.1); 
                    
            var y = d3.scaleLinear().range([height, 0]);
            var xAxis = d3.axisBottom(x0);
            var yAxis = d3.axisLeft(y).tickFormat(d3.format(format_scale_yAxis(countOrPerc)));

            svg.append("g")
               .attr("class", "x axis")
               .attr("transform", "translate(0," + height + ")")
               .call(xAxis)
               .selectAll("text")
               .style("font-size", "13px")
               .style("font-family", "sans")
               .style("text-anchor", "end")
               .attr("dx", "-.8em")
               .attr("dy", ".55em")
               .attr("transform", "rotate(-30)");

            svg.append("g")
               .attr("class", "y axis")
               .call(yAxis)
               .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")
               .style('font-weight','bold');
                

            //Updating by DropDown
            dG.update = function(drop_selected, types, turn){
                //Filtering selected Country
                selection = [];
                selection_new = [];
                var selection = 
                    data_gear.filter(function(d) {
                        return d.key == uniqueCountryArray[drop_selected[0]];
                    });
                
                if (selection == "") {
                    selection.push ({
                        key : uniqueCountryArray[drop_selected[0]],
                        values : []
                    })
                }
                
                selection.push(data_gear.filter(function(d){
                    return d.key == uniqueCountryArray[drop_selected[1]];
                })[0]);
                
                if (!selection[1]) {
                    selection[1] = {
                        key : uniqueCountryArray[drop_selected[1]],
                        values : []
                    }
                }
                
                //Adding nonExist Types to Country
                for(var i =0;i<types.length;i++){	
                    var a=0;
                    for(var j =0;j<selection[0].values.length;j++){	
                        if (types[i] == selection[0].values[j].key) {var a=1;}
                    }
                    if (a==0){selection[0].values.push({key : types[i],value : {length : 0, perc : 0, std : 0}})}
                    var a=0;
                    for(var j =0;j<selection[1].values.length;j++){	
                        if (types[i] == selection[1].values[j].key) {var a=1;}
                    }
                    if (a==0){selection[1].values.push({key : types[i],value : {length : 0, perc : 0, std : 0}})}
                    selection_new.push({key : types[i],values : []})
                }
                
                
                //Merge two Selected Dropdown
                for(var i =0;i<selection_new.length;i++){
                    for(var j =0;j<2;j++) {
                        var std = selection[j].values.filter(function(d) {return d.key == selection_new[i].key})[0].value.std;
                        var perc = selection[j].values.filter(function(d) {return d.key == selection_new[i].key})[0].value.perc;
                        selection_new[i].values.push({std : std, perc : perc, country : uniqueCountryArray[drop_selected[j]]});
                    }
                }
            
                //Color and Axis
                var inlineCountry = selection_new[0].values.map(function(d) { return d.country; });
                var color = 
                    d3.scaleOrdinal()
                      .domain(inlineCountry)
                      .range(["blue","#f25618"]); 
            
                var x1 = 
                    d3.scaleBand()
                      .domain(inlineCountry)
                      .rangeRound([0, x0.bandwidth()]);
            
                var y = 
                    d3.scaleLinear()
                      .domain([0, d3.max(selection_new, function(categorie) { return d3.max(categorie.values, function(d) { return d[countOrPerc]; }); })])
                      .range([height, 0]);

                yAxis.scale(y).tickFormat(d3.format(format_scale_yAxis(countOrPerc)));
            
            
                //Append Slice Group for xAxis
                var slice = svg.selectAll(".types").data(selection_new)
                slice
                    .enter()
                    .append("g")
                    .attr("class", "types")
                    .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; });
            
                
                //Append Country to Slice Group
                var sliceCountry = slice.selectAll("rect").data(function(d){return d.values; });	
                sliceCountry.enter().append("rect").attr('height', 0);
                slice
                    .selectAll("rect")
                    .attr("name", function(d,i) {  return d.country; })
                    .attr("class","rectangle")
                    .attr("width", x1.bandwidth())
                    .attr("x", function(d) { return x1(d.country);})
                    .style("fill", function(d) { return color(d.country) })
                    .on("mouseover", function(d) {
                        d3.select(this).style("fill", d3.rgb(color(d.country)).darker(2)); 
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("fill", color(d.country));
                    })
                    .append("title")
                    .attr("class", "title")
                    .text(function(d){
                        return d.country + " : " + d3.format(format_scale(countOrPerc))(d[countOrPerc]); 
                    });
                
                if (turn == 1){
                    slice
                        .selectAll("rect")
                        .attr("y", function(d) { return y(0); })
                        .attr("height", function(d) { return height - y(0); });
                }

                slice
                    .selectAll("rect")
                    .transition()
                    .duration(1000)
                    .attr("y", function(d) { return y(d[countOrPerc]); })
                    .attr("height", function(d) { return height - y(d[countOrPerc]); });
            
                d3
                    .selectAll("g.y.axis")
                    .transition()
                    .duration(1000)
                    .call(yAxis);
            }
            
            inlineCountryId = [];
            inlineCountryId.push(+d3.select('#dropdown').property('value'),+d3.select('#dropdown2').property('value'));

            
            //plot selected button
            selected_button = d3.select(".chart-button.button-on").attr("name");
            if (selected_button == "Gear") {dG.update(inlineCountryId, types_gear, 1)}
            else if (selected_button == "Vessel") {dG.update(inlineCountryId, types_vessel, 1)}
            else if (selected_button == "GearVessel") {GearVessel("GearVessel")}
            return dG;
        }


        // Third Steps
        function fillDropdown(uniqueCountryArray){
            //Clear Dropdown
            document.querySelectorAll('option').forEach(guardian => guardian.remove());
            selector
                .selectAll("option")
                .data(uniqueCountryArray)
                .enter()
                .append("option")
                .attr("value", function(d, i){
                    return i;
                })
                .text(function(d){
                    return d;
                });
            
            selector2
                .selectAll("option")
                .data(uniqueCountryArray)
                .enter()
                .append("option")
                .attr("value", function(d, i){
                    return i;
                })
                .text(function(d){
                    return d;
                });

            d3.select('#dropdown').property('value',FirstDropId);
            d3.select('#dropdown2').property('value',SecondDropId);
            radioCheck = 0;
        }

        
        function changeIt() {
            //clear Visual
            d3.selectAll(".types").remove();
            d3.selectAll(".rectangle").remove();
            d3.selectAll(".axis").remove();
                    
            //Calculate uniqueCountryArray by Radio
            //Select Checked Radio
            var form = document.getElementById("dimensions");
            if(form[0].checked){
                if (form[0].name == "first") {
                    form_val = form[0].id;
                }
            }
            
                
            //Get Countries or Regions
            var country = data.map(function(x) { return x[form_val]; }); 
            uniqueCountryArray = country.filter(function(elem, pos) {
                return country.indexOf(elem) == pos;
            });
            uniqueCountryArray = uniqueCountryArray.sort(d3.ascending);


            //Selected Country Canada & USA
            if (form_val == "country") {
                FirstDropId = uniqueCountryArray.indexOf("Canada");
                SecondDropId = uniqueCountryArray.indexOf("United States of America");
            }
            else if (form_val == "region") {
                FirstDropId = uniqueCountryArray.indexOf("Europe");
                SecondDropId = uniqueCountryArray.indexOf("North America and Canada");
            }
            
            if (radioCheck == 1){
                fillDropdown(uniqueCountryArray);
            }
            if (d3.select("#myCheckbox").property("checked")) {
                d3.select('#dropdown2').classed("hidden", false);
            } else {
                d3.select('#dropdown2').property('value',d3.select('#dropdown').property('value'));
                d3.select('#dropdown2').classed("hidden", true);
            }

            
            //Gear or Vessel
            selected_button = d3.select(".button-on").attr("name");

            //Count or Perc
            countOrPerc = d3.select(".second-button.button-on").attr("id");

            var inlineCountryId = [];
            inlineCountryId.push(+d3.select('#dropdown').property('value'),+d3.select('#dropdown2').property('value'));
            if (selected_button == "Gear") {
                drawGraph(main_gear, inlineCountryId, types_gear, form_val);
            }
            else if (selected_button == "Vessel") {
                drawGraph(main_vessel, inlineCountryId, types_vessel, form_val)
            }
            else if (selected_button == "GearVessel") {
                GearVessel("GearVessel")
            }
            if (selected_button == "Gear") {
                drawGraph(main_gear, inlineCountryId, types_gear, form_val);
            }
            else if (selected_button == "Vessel") {
                drawGraph(main_vessel, inlineCountryId, types_vessel, form_val);
            }
            else if (selected_button == "GearVessel") {
                GearVessel("GearVessel");
            }
        }


        // Second Steps
        function button_click() {
            underConstr.classed("hidden", true);
            if (d3.select(this).classed("chart-button")) {
                selected_tab = "chart-button";
            }
            else if (d3.select(this).classed("second-button")) {
                selected_tab = "second-button";
            }        
            
            //Disabled Compare
            if (selected_tab == "second-button") {
                if (d3.select(this).attr("id") == "perc") {
                    d3.select("#myCheckbox").property("disabled",true);
                    d3.select("#myCheckbox").property("checked",false);
                } else {
                    d3.select("#myCheckbox").property("disabled",false);
                }
            }
                    
            //change button class
            d3.selectAll("."+selected_tab).classed("button-on", false);
            d3.selectAll("."+selected_tab).classed("button-off", true);
            d3.select(this).classed("button-off", false);
            d3.select(this).classed("button-on", true);
            changeIt();
        }

        
        function GearVessel(data) {
            underConstr.classed("hidden", false);
        }
            
        
        function radioChange() {
            radioCheck = 1;
            changeIt();
        }

        
        function update_checkbox() {
            if(d3.select("#myCheckbox").property("checked")) {
                d3.select('#dropdown2').classed("hidden", false);
                if (form_val == "country") {
                    SecondDropId = uniqueCountryArray.indexOf("United States of America");
                }
                else if (form_val == "region") {
                    SecondDropId = uniqueCountryArray.indexOf("North America and Canada");
                }
                d3.select('#dropdown2').property('value',SecondDropId);
            } else {
                d3.select('#dropdown2').property('value',d3.select('#dropdown').property('value'));
                d3.select('#dropdown2').classed("hidden", true);
            }
            dropChange();
        }
                
        let dropChange = function() {
            d3.selectAll(".title").remove()    
            if(!d3.select("#myCheckbox").property("checked")) {
                d3.select('#dropdown2').property('value',d3.select('#dropdown').property('value'));
            }
                    
            inlineCountryId = [];
            inlineCountryId.push(+d3.select('#dropdown').property('value'),+d3.select('#dropdown2').property('value'));
            
            //Gear or Vessel
            selected_button = d3.select(".button-on").attr("name");
            if (selected_button == "Gear") {
                dG.update(inlineCountryId, types_gear, 0);
            }
            else if (selected_button == "Vessel") {
                dG.update(inlineCountryId, types_vessel, 0);
            }
        }


        // First Steps
        // Buttons
        d3.selectAll("button").on("click", button_click);

        //Radio Buttons
        var dataDim = d3.select("#dimensions");
        dataDim.on("change", radioChange);

        //CheckBox
        d3.select("#myCheckbox").on("change",update_checkbox);

        //First Dropdown
        var selector = 
            d3.select("#drop")
              .append("select")
              .attr("id","dropdown")
              .style("border", "2px")
              .style("border-style", "outset")
              .style("border-color", "blue") 
              .on("change", dropChange);
                
        //Second Dropdown
        var selector2 = 
            d3.select("#drop")
              .append("select")
              .attr("id","dropdown2")
              .style("border", "2px")
              .style("border-style", "outset")
              .style("border-color", "#f25618")
              .on("change", dropChange);

        //Globale Variables
        var FirstDropId, SecondDropId, form_val, countOrPerc, uniqueCountryArray, inlineCountryId;
        var radioCheck = 1;

        changeIt();
        var	dG = drawGraph(main_gear, inlineCountryId, types_gear, form_val);
    }
}
  
