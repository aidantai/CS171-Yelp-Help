export { BarCuisine };

class BarCuisine {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.dependentVar = "count";

        this.cuisineMetaData = {
            count: {
                title: "Number of Restaurants by Cuisine",
                leafFn: (leaves) => leaves.length,
                description: "Notice how American restaurants are by far the most prolific cuisine? This is mostly due to the fact that our dataset and Yelp reviews are set in America. The most reviewed restaurants were also set in New Orleans, further biasing the dataset towards American cuisine."
            },
            star: {
                title: "Average Star Rating by Cuisine",
                leafFn: (leaves) => d3.mean(leaves, d => d.stars),
                description: "Surprisingly, the average star ratings for each cuisine plateaued evenly around 4 stars, which may indicate that across all cuisines, most people tend to enjoy the food. Or, the people who eat the cuisine are already fans."
            },
            review: {
                title: "Review Count by Cuisine",
                leafFn: (leaves) => d3.mean(leaves, d => d.review_count),
                description: "Now you might be wondering why Cajun food is the most reviewed in this dataset. A large part of our reviews were set in New Orleans, home to a large population of Cajuns, also known as Louisana Acadians."
            }
        }

        this.title = this.cuisineMetaData[this.dependentVar].title;
        this.leafFn = this.cuisineMetaData[this.dependentVar].leafFn;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.title_group = vis.svg.append('g')
            .attr('class', 'title bar-title')

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

        // vis.descriptionsvg = d3.select("#barchart-svg").append("svg")
        //     .attr("width", document.getElementById("barchart-svg").getBoundingClientRect().width)
        //     .attr("height", document.getElementById("barchart-svg").getBoundingClientRect().height)

        // vis.description_group = vis.descriptionsvg.append('g')
        //     .attr('class', 'title bar-title')


        vis.wrangleData();
    }

    wrangleData(dependentVar="count"){
        let vis = this;

        vis.dependentVar = dependentVar;
        vis.title = vis.cuisineMetaData[vis.dependentVar].title;
        vis.leafFn = vis.cuisineMetaData[vis.dependentVar].leafFn;

        // Some businesses have multiple cuisines, so we need to create multiple copies of the business for each cuisine
        // for each business, return an array of duplicated businesses each with a unique cuisine
        // map func basically just appending cuisine val
        vis.duplicatedData = vis.data.flatMap(d => {
            return d.cuisines.map(cuisine => {
                return {
                    ...d,
                    cuisine
                }
            })
        })

        vis.description = vis.cuisineMetaData[vis.dependentVar].description;


        vis.displayData = Array.from(d3.rollup(vis.duplicatedData, vis.leafFn, d=>d.cuisine), ([cuisine, val]) => ({cuisine, val}));
        vis.displayData = vis.displayData.sort((a, b) => b.val - a.val);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;


        

        // x domain: business name
        vis.x.domain(d3.map(vis.displayData, function (d) { return d.cuisine; }));
        // y domain: range of specified val
        vis.y.domain([0, d3.max(vis.displayData, function (d) { 
            if (vis.dependentVar == "star") return 5;
            return d.val; })]);

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
            .attr("fill", "#5B2405")

            // add title
        
        vis.title_group.selectAll(".title")
            .data([vis.title])
            .join("text")
            .attr("class", "title")
            .text(d => d)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // vis.description_group.selectAll(".description")
        //     .data([vis.description])
        //     .join("text")
        //     .attr("class", "description")
        //     .text(d => d)
        //     .attr('transform', `translate(100, 50)`)
        //     .attr('text-anchor', 'middle');

        document.getElementById("barchart-text").innerHTML = vis.description;

    }
}