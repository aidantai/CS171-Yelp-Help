class BarChart {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;

        // this.parseDate = d3.timeParse("%m/%d/%Y");
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 500;
        vis.height = 500;
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("BarChart Title")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');


        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0,0)");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;
        vis.filteredData = vis.data.slice(0, 10);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        // x domain: business name
        vis.x.domain(d3.map(vis.filteredData, function (d) { return d.name; }));
        // y domain: star range
        vis.y.domain([0, d3.max(vis.filteredData, function (d) { return d.stars; })]);

        // call axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);


        vis.rects = vis.svg.selectAll(".bar")
            .data(vis.filteredData)
            .join("rect")
            .attr("class", "bar")
            .transition()
            .attr("x", (d) => vis.x(d.name))
            .attr("y", (d) => vis.y(d.stars))
            .attr("width", vis.x.bandwidth())
            .attr("height", (d) => vis.height - vis.y(d.stars))
            .attr("fill", "blue");

    }



}