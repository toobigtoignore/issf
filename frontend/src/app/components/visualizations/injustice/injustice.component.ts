import { Component, OnInit, Input, AfterViewInit, Inject } from '@angular/core';
import * as d3 from 'd3';

// Adopted from Basic barplot example on D3 Graph Gallery:
// https://www.d3-graph-gallery.com/graph/barplot_basic.html
@Component({
  selector: 'app-injustice',
  templateUrl: './injustice.component.html',
  styleUrls: ['./injustice.component.css']
})
export class InjusticeComponent implements OnInit {

  private svg;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);
  @Input() data : any
  private data_1

  constructor() {}


  ngOnInit(): void {
    this.drawConsole(this.data)
  }

  ngAfterViewInit() {

  }

  private drawConsole(data){
     var data_types = data.columns.slice(3)

      var data_country = Object.values(d3.map(data, d=> d.ssf_country )).sort(d3.ascending)

      data_country = data_country.filter((n, i) => data_country.indexOf(n) === i);

      // var temp_arr: any[] = []
      // var temp_str: string = ""

      // for(var i =0;i<data_country.length;i++){
      //   if (temp_str != data_country[i]){
      //     temp_arr.push(data_country[i])
      //   }
      //   temp_str = data_country[i]
      // }
      // data_country = temp_arr

			var data_array = []
			for(var i =0;i<data_country.length;i++){

				var data_country_filtered = data.filter(m => (m.ssf_country == data_country[i]))
        var count_issf:any = d3.map(data_country_filtered, function(c){return c.issf_core_id;}) //.keys() //.length

        count_issf = count_issf.filter((n, i) => count_issf.indexOf(n) === i).length;

				// console.log(count_issf);
				data_array.push({country: data_country[i], total: 0, record: count_issf})
				for(var j =0;j<data_types.length;j++){
					 data_array[i][data_types[j]] = 0
        }

        // console.log(count_issf);
			}

			for(var i =0;i<data.length;i++){
				var index = data_array.findIndex(x => x.country === data[i].ssf_country)
				for(var j =0;j<data_types.length;j++){
					if (data[i][data_types[j]] != ""){
						data_array[index][data_types[j]] = data_array[index][data_types[j]] + 1
						data_array[index].total = data_array[index].total + 1
					}
				}
      }

      var csv = data_array

			var keys = data_types

			// Define 'div' for tooltips
			var div = d3.select("#visual4")
				.append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

			// //SVG elements
			var svg = d3.select("#chart"),
				margin = {top: 75, left: 40, bottom: 0, right: 0},
				width = +svg.attr("width") - margin.left - margin.right,
				height = +svg.attr("height") - margin.top - margin.bottom

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

			var z = d3.scaleOrdinal(d3.schemeTableau10);

			//Legend
      var legspacing = 140;

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
					return (i<=4)? (i * legspacing)+legspacing : ((i * legspacing) - (legspacing*5))+legspacing;
					})
				.attr("y", function (d, i) {
					return (i<=4)?10:35;
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
					return (i<=4)?25:50;
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
        .attr("opacity", 1);

        data = csv

				y.domain([0, 2+d3.max(data, function(d) { return d.total; })]).nice();


				data.sort(d3.select("#sort").property("checked")
					? (a, b) => data_country.indexOf(a.country) - data_country.indexOf(b.country)
					: (a, b) => b.total - a.total)

				x.domain(data.map(d => d.country));

				var group = svg.selectAll("g.layer")
          .data(d3.stack().keys(keys)(data), d => d.key)
//     console.log(group)
// console.log(d3.stack().keys(keys)(data), d => d.key)
				group.exit().remove()

				group.enter().append("g")
					.classed("layer", true)
					.attr("fill", d => z(d.key));

				var bars = svg.selectAll("g.layer").selectAll("rect")
					.data(d => d, e => e.data.country)
          // console.log(bars)
				bars.exit().remove()

				bars.enter().append("rect")
					.attr("width", x.bandwidth())
					.on("mouseover", function() { div.style("visibility", "visible");}) //.style("width", "100px")
					.on("mousemove", function(d) {
            var typeName = d3.select(this.parentNode).datum().key;

						var typeValue = d.srcElement.__data__.data[typeName];
						var total = d.srcElement.__data__.data.total;
						div.style("opacity", .9);

            div
            .html(
							 "<b>" + typeName + " : "  + typeValue +
							"</b><br>" + d.srcElement.__data__.data.country + " : "  + total)

							// .style("left", (d3.event.pageX) + "px")
            	// .style("top", (d3.event.pageY - 45) + "px");
            // console.log(d.srcElement.__data__.data)
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
						// var typeValue = d.data[typeName];
            // var total = d.data.total;
            var typeValue = d.srcElement.__data__.data[typeName];
						var total = d.srcElement.__data__.data.total;
						div.style("opacity", .9);

						div.html(
							 "<b>" + typeName + " : "  + typeValue +
							"</b><br>" + d.srcElement.__data__.data.country + " : "  + total)

							// .style("left", (d3.event.pageX) + "px")
							// .style("top", (d3.event.pageY - 45) + "px");
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

			} //function update(speed)

			var checkbox = d3.select("#sort")
				.on("click", function() {
					update(750)
				})

      // console.log(data_array);
  }















  private createSvg(): void {
    this.svg = d3.select("figure#test1")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Add X axis
    const x = d3.scaleBand()
    .range([0, this.width])
    .domain(data.map(d => d.Framework))
    .padding(0.2);

    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([0, 200000])
    .range([this.height, 0]);

    this.svg.append("g")
    .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Framework))
    .attr("y", d => y(d.Stars))
    .attr("width", x.bandwidth())
    .attr("height", (d) => this.height - y(d.Stars))
    .attr("fill", "#d04a35");
  }
}
