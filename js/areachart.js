
/*
 * Timeline - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the timeline should use
 */

export {Areachart};
class Areachart {

	// constructor method to initialize Timeline object
	constructor(parentElement, data, brushed){
		this._parentElement = parentElement;
		this._data = data;

		// No data wrangling, no update sequence

        let dataDict = {}; 
        data.forEach(d => {
            let date = d3.timeParse("%Y-%m")(d.date);
            date = d3.timeFormat("%Y-%m")(date);
            if (d.date in dataDict) {
                dataDict[date] += d.count;
            }
            else {
                dataDict[date] = d.count;
            }
        });

        this._displayData = []
        Object.entries(dataDict).forEach(([k, v]) => {
            this._displayData.push({
                date: new Date(k),
                count: v
            })
        })

        this._displayData.sort((a,b) => a.date - b.date)


        this.initVis()
	}

	// create initVis method for Timeline class
	initVis() {

		// store keyword this which refers to the object it belongs to in variable vis
		let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 40};

		vis.width = document.getElementById(vis._parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis._parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis._parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


		// Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis._displayData, d => d.date));

		vis.y = d3.scaleLinear()
			.range([vis.height, 0])
			.domain([0, d3.max(vis._displayData, function(d) { return d.count; })]);

		vis.xAxis = d3.axisBottom()
			.scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

		// SVG area path generator
		vis.area = d3.area()
			.x(function(d) { 
                return vis.x(d.date); })
			.y0(vis.height)
			.y1(function(d) { 
                return vis.y(d.count); });

		// Draw area by using the path generator
		vis.svg.append("path")
			.datum(vis._displayData)
			.attr("fill", "#ccc")
			.attr("d", vis.area);

		// vis.xScale = d3.scaleTime()
		// 	.range([0, width])
		// 	.domain(d3.extent(displayData, function(d) { return d.Year; }));


		// Append x-axis
		vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")")
			.call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0, " + 0 + ")")
            .call(vis.yAxis);

        }
	
}