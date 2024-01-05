import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3_geo from 'd3-geo-projection';


@Component({
    selector: 'app-mshare',
    templateUrl: './mshare.component.html',
    styleUrls: ['./mshare.component.css'],
    encapsulation: ViewEncapsulation.None
})


export class MshareComponent implements OnInit {
    public screenWidth: number;
    @Input() data : any;

    
    constructor() { }


    ngOnInit(): void {
        this.drawConsole(this.data);
        this.screenWidth = window.innerWidth;
    }


    private drawConsole(data): void {
        let self = this;
        var data_market,data_world,label,id,tF,pieDim,localname,nD,sD,records,s;


        // set the dimensions and margins of the graph
        var margin = {top: 0, right: 0, bottom: 0, left: 10},
            svgWidth = 920,
            svgHeight = this.screenWidth > 1199 ? 380 : 650,
            width = svgWidth - margin.left - margin.right,
            height = svgHeight - margin.top - margin.bottom;


        // append the svg object to the body of the page
        var svg = d3.select("#mshare-svg")
                    .append("svg")
                    .attr("class", "svgmap")
                    .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
                    .attr("preserveAspectRatio", "xMinYMin meet")


        var g_scroll =	
            svg.call(d3.zoom().scaleExtent([1, 20]).on("zoom", function () {
                g_scroll.attr("transform", d3.event.transform);
            }))
            .append("g")
            .attr("id","scroll_group");
            

        //for tooltip 
        var offsetL = document.getElementById('visual-mshare').offsetLeft+10;
        var offsetT = document.getElementById('visual-mshare').offsetTop+10;


        var tooltip = 
            d3.select("#visual-mshare")
              .append("div")
              .attr("class", "tooltip");


        // Map and projection
        var projection = 
            d3_geo.geoRobinson() //geoMercator  geoRobinson
                  .scale(170) //.scale(100)
                  .center([0,0])  //.center([0,60])
                  .translate([width / 2, (height / 2) + 30]);

        var path = d3.geoPath().projection(projection)


        // Load external datas
        d3.queue()
          .defer(d3.json, "/assets/vis/world.geojson")
          // .defer(d3.csv, "/assets/vis/mshare.csv")
          .await(ready);


        function ready(error, topo) {
            d3.select("#visual-mshare")
              .transition()
              .ease(d3.easeLinear)
              .duration(400)
              .style("opacity", 1);

            var data = self.data
            d3.select("#reset-button").on("click", reset);
            
            function reset() {
                d3.selectAll("#map").style("stroke-width", 0.5);
                g_scroll.attr("transform", "translate(0,0)scale(1)")
                d3.select('.selected').classed('selected', false);
                pC.update(tF);
                leg.update(tF, "WORLD", recordsWorld);
            }

            var unselected = function(d) {
                if (d3.event.defaultPrevented) return; 
                localname = d3.event.target.localName;
                if (localname == "svg") {
                    d3.select('.selected').classed('selected', false);
                    pC.update(tF);
                    leg.update(tF, "WORLD", recordsWorld);
                }
            }


            svg.on("click", unselected)
            var data = data.filter(function(s){ return s.country != "#N/A" && s.market_share != "" && s.additional != "";});
            var priority_order = ['Retained for household consumption and given to family/friends', 'Sold in local markets', 'Sold to outside markets', 'Going to non-food uses', 'Other'];


            var priority_scale = 
                d3.scaleOrdinal()
                  .domain(priority_order)
                  .range(["mapRetained", "mapSoldin", "mapSoldout", "mapGoing", "mapOther"]);


            data_market = 
                d3.nest()
                  .key(function(d) { return d.country; })
                  .key(function(d) { return d.market_share; }).sortKeys(function(a,b) { return priority_order.indexOf(a) - priority_order.indexOf(b); })
                  .rollup(function(v) { 
                      return {
                        total: d3.sum(v, function(d) { return d.additional; })
                      }; 
                  })
                 .entries(data);


            data_market.forEach(function (d) {
                var data_issf = d3.map(data.filter(function(m){return m.country == d.key;}), function(m){return m.issf_core_id;}).keys()
                d.records = data_issf.length
                d.values.forEach(function (v) {
                    v.std = +d3.format(".5f")((v.value.total/d.records))
                });
            })


            data_world = 
                d3.nest()
                  .key(function(d) { return d.market_share; }).sortKeys(function(a,b) { return priority_order.indexOf(a) - priority_order.indexOf(b); })
                  .rollup(function(v) { 
                      return {
                        total: d3.sum(v, function(d) { return d.additional; })
                    }; 
                  })
                  .entries(data);


            data_world.forEach(function (d) {
                var data_issf = d3.map(data, function(m){return m.issf_core_id;}).keys()
                d.records = data_issf.length
                d.std = +d3.format(".5f")((d.value.total/d.records))
            })


            var recordsWorld = data_world[0].records


            // Draw the map
            g_scroll
                .append("g")
                .attr("class", "map")
                .attr("id", "map")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill","#f2efe9")  //f2efe9 //DEB887
                .style("stroke", "#666")
                .style("stroke-width", "0.5px")
                .style("cursor", "pointer")
                .attr("id", "map" )
                .attr("class", 
                    d => ((d3.map(data.filter(function(s){return s.country == d.properties.name;}), function(v){return(v.market_share)}).keys().indexOf("Retained for household consumption and given to family/friends") !== -1) ? "mapRetained" : "none")
                        + " "
                        + ((d3.map(data.filter(function(s){return s.country == d.properties.name;}), function(v){return(v.market_share)}).keys().indexOf("Sold in local markets") !== -1) ? "mapSoldin" : "none")
                        + " "
                        + ((d3.map(data.filter(function(s){return s.country == d.properties.name;}), function(v){return(v.market_share)}).keys().indexOf("Sold to outside markets") !== -1) ? "mapSoldout" : "none")
                        + " "
                        + ((d3.map(data.filter(function(s){return s.country == d.properties.name;}), function(v){return(v.market_share)}).keys().indexOf("Going to non-food uses") !== -1) ? "mapGoing" : "none")
                        + " "
                        + ((d3.map(data.filter(function(s){return s.country == d.properties.name;}), function(v){return(v.market_share)}).keys().indexOf("Other") !== -1) ? "mapOther" : "none")
                )
                .style("opacity", .8)
                .on('click', selected)
                .on("mousemove", showTooltip)
                .on("mouseout",  function(d,i) {
                    tooltip.attr("class", "hidden");
                })


                function selected(d) {
                    if (d3.event.defaultPrevented) return; 
                    d3.select('.selected').classed('selected', false);
                    d3.select(this).classed('selected', true);
                    var country_name = d["properties"]["name"];
                    nD = data_market.filter(function(m){return country_name == m.key;})

                    if (nD == "") {
                        nD.push({
                            key : country_name, 
                            records :0, 
                            values : []
                        }); 
                        for(var j =0;j<priority_order.length;j++) {
                            nD[0].values.push({key : priority_order[j], std :0});   
                        }
                    }

                    sD = nD[0].values
                    records = nD[0].records

                    var marketshare = d3.map(sD, function(d){return(d.key)}).keys()

                    //Adding nonExist Types to Country
                    for(var j =0;j<priority_order.length;j++){
                        if(marketshare.indexOf(priority_order[j])===-1){
                            sD.push({
                                key : priority_order[j], 
                                std :0
                            }); 
                        }
                    }


                    sD.sort(function(a, b){return priority_order.indexOf(a["key"]) - priority_order.indexOf(b["key"]);});
                    pC.update(sD);
                    leg.update(sD, country_name, records);
                }


                function showTooltip(d) {
                    label = d.properties.name;
                    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
                    tooltip.attr("class", "tooltip")
                           .attr("style", "left:"+(d3.event.pageX - 100)+"px;top:"+(d3.event.pageY - 120)+"px")
                           .html("<span class='arrow'></span>" + label );
                }


                id = "#mshare-svg-pie";
                var piediv = d3.select(id).append("div").attr("class", "row")


                var colorChart = 
                    d3.scaleOrdinal()
                      .domain(priority_order)
                      //.range(["#0000FF", "#FF4500", "#008000", "#e823d1", "#696969"]);
                      .range(["#3f51b5", "#d81b60", "#4caf50", "#964b00", "#000000"]);


                var x = d3.scaleOrdinal()
                          .domain(priority_order)
                          .range(["mapRetained", "mapSoldin", "mapSoldout", "mapGoing", "mapOther"]);


                // function to handle pieChart.
                function pieChart(pD) {
                    var pC ={update: null}, 
                    pieDim = {
                        w: 300, 
                        h: 250,
                        r: null
                    };
                    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

                    // create svg for pie chart.
                    var piesvg = 
                        piediv.append("div")
                              .attr("class", "pie-chart-container") //d3.select(id).append("div") //.style("display","inline-block").style("width","100px")
                              .append("svg")
                              .attr("width", pieDim.w).attr("height", pieDim.h)
                              .append("g")
                              .attr("transform", "translate("+(pieDim.w/2 - 40)+","+(pieDim.h/2 - 20)+")");


                    // create function to draw the arcs of the pie slices.
                    var arc = d3.arc().outerRadius(pieDim.r - 20).innerRadius(0);

                    // create a function to compute the pie slice angles.
                    var pie = d3.pie().sort(null).value(function(d) { return d.std; });


                    // Draw the pie slices.
                    var mouseoverChart = function(d){
                        d3.select('.selected').classed('selected', false);
                        d3.selectAll("path") //all pie
                        .transition()
                        .duration(200)
                        .style("opacity", .8)
                        .style("stroke", "transparent")

                        d3.select(this) //selected pie
                          .transition()
                          .duration(200)
                          .style("opacity", 1)
                          .style("stroke", "black")
                        
                        d3.selectAll("#map") //all map
                          .transition()
                          .duration(200)
                          .attr("fill","#f2efe9")

                        d3.selectAll("."+x(d3.select(this).attr("class"))) //proper map
                          .transition()
                          .duration(200)
                          .attr("fill",colorChart(d3.select(this).attr("class")))
                    }


                    var mouseleaveChart = function(d){
                        d3.selectAll("path") //all pie
                          .transition()
                          .duration(200)
                          .style("opacity", 1)
                          .style("stroke", "transparent")
                        
                        d3.selectAll("#map") //all map
                          .transition()
                          .duration(200)
                          .attr("fill","#f2efe9")
                    }


                    piesvg.selectAll("path")
                          .data(pie(pD))
                          .enter()
                          .append("path")
                          .attr("class", function(d) { return d.data.key; })
                          .attr("d", arc)
                          .each(function(d) { this._current = d; })
                          .style("fill", function(d) { return colorChart(d.data.key); })
                          .on("mouseover",mouseoverChart)
                          .on("mouseleave",mouseleaveChart);


                    // create function to update pie-chart. This will be used by histogram.
                    pC.update = function(nD){
                        piesvg.selectAll("path").data(pie(nD)).transition().duration(700)
                        .attrTween("d", arcTween);
                    }        

                    // Animating the pie-slice requiring a custom function which specifies
                    function arcTween(a) {
                        var i = d3.interpolate(this._current, a);
                        this._current = i(0);
                        return function(t) { 
                            return arc(i(t));    
                        };
                    }    
                return pC;
            }

            // function to handle legend.
            function legend(lD, country){
                var leg = {update: null};
                pieDim ={w:500, h: 300};

                var records = lD[0].records
                // create table for legend.
                var legend = 
                    piediv.append("div")
                          .attr("class", "table-info") //d3.select(id).append("span") //.style("display","inline-block").style("float","right")
                          .append("table")
                          .attr('class','legend')
                          .style("font-size", "20px");

                var header = legend.append("thead").append("tr");
                header
                    .selectAll("th")
                    .data(["WORLD"])
                    .enter()
                    .append("th")
                    .attr("colspan", 4)
                    .text(function(d) { return d+" ("+records+" records)"; });


                var tr = 
                    legend
                        .append("tbody")
                        .selectAll("tr")
                        .data(lD)
                        .enter()
                        .append("tr");

                // create the first column for each segment.
                tr.append("td")
                  .append("svg")
                  .attr("width", '16')
                  .attr("height", '16')
                  .append("rect")
                  .attr("width", '16')
                  .attr("height", '16')
                  .attr("fill",function(d){ return colorChart(d.key); });

                // create the second column for each segment.
                tr.append("td")
                  .attr("class",'legendMarket')
                  .text(function(d){ return d.key;});


                // create the fourth column for each segment.
                tr.append("td")
                  .attr("class",'legendPerc')
                  .text(function(d){ return getLegend(d,lD);});

                // Utility function to be used to update the legend.
                leg.update = function(nD, country, records) {

                    // update the data attached to the row elements.
                    var l_h = legend.select("thead").selectAll("tr").data(nD);

                    // update the frequencies.
                    l_h.select("th")
                    .attr("colspan", 4).text(country+" ("+records+" records)");

                    // update the data attached to the row elements.
                    var l = legend.select("tbody").selectAll("tr").data(nD);

                    // update the frequencies.
                    l.select(".legendMarket").text(function(d){ return d.key;});

                    // update the percentage column.
                    l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
                }

                
                // Utility function to compute percentage.
                function getLegend(d,aD) { 
                    if (d3.sum(aD.map(function(v){ return v.std; })) == 0){
                        return d3.format(".2%")("0");
                    }
                    else {
                        return d3.format(".2%")(d.std/d3.sum(
                                aD.map(function(v){ 
                                    return v.std; 
                                }) 
                            ));
                        }
                }
                return leg;
            }


            tF = data_world;
            var	pC = pieChart(tF), // create the pie-chart.
            leg= legend(tF, "WORLD");  // create the legend.
        }
    }
}
