class BarCuisine {

    constructor(parentElement, data, title, leafFn){
        this.parentElement = parentElement;
        this.data = data;
        this.leafFn = leafFn;
        this.title = title;
        this.cuisines = ["Chinese", "Japanese", "Korean", "Thai", "Vietnamese", "Indian", "French", "Italian", "Mexican", "Spanish", "Middle Eastern", "Mediterranean", "American", "African", "Caribbean", "Latin American", "Brazilian", "Cuban", "Hawaiian", "Filipino", "British", "Irish", "Scottish", "German", "Greek", "Turkish", "Russian", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese"];

        // this.parseDate = d3.timeParse("%m/%d/%Y");
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 1300;
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
            .text(vis.title)
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
        // Slice data to only 1000 businesses
        vis.filteredData = vis.data.slice(0, 2000);
        // Filter out to only use businesses with matching cuisine categories from vis.cuisines
        // Add a cuisine key to each business marking it
        vis.filteredData = vis.filteredData.filter(business => {
            let hasMatch = false;
            business.categories.forEach(category => {
                // some businesses have multiple cuisine categories, unfortunately will only use the first one
                if (vis.cuisines.includes(category)) {
                    business.cuisine = category;
                    hasMatch = true;
                }
            }
            )
            return hasMatch;
        });

        vis.displayData = Array.from(d3.rollup(vis.filteredData, vis.leafFn, d=>d.cuisine), ([cuisine, val]) => ({cuisine, val}));
        vis.displayData = vis.displayData.sort((a, b) => b.val - a.val);
        console.log(vis.displayData)

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        // x domain: business name
        vis.x.domain(d3.map(vis.displayData, function (d) { return d.cuisine; }));
        // y domain: range of specified val
        vis.y.domain([0, d3.max(vis.displayData, function (d) { return d.val; })]);

        // call axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);


        vis.rects = vis.svg.selectAll(".bar")
            .data(vis.displayData)
            .join("rect")
            .attr("class", "bar")
            .transition()
            .attr("x", (d) => vis.x(d.cuisine))
            .attr("y", (d) => vis.y(d.val))
            .attr("width", vis.x.bandwidth())
            .attr("height", (d) => vis.height - vis.y(d.val))
            .attr("fill", "steelblue");

    }



}