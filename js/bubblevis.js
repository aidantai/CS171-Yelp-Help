export {BubbleVis};

class BubbleVis {


    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;

        // this.categories = ["food", "service", "price", "ambiance", "wait", "cleanliness", "portion size", "menu", "consistency", "dietary accommodations", "customer interaction", "crowdiness", "parking", "drinks", "reservations", "authenticity", "special events", "staff knowledge", "technology"]
        this.categories = ["food", "service", "price", "ambiance", "wait", "cleanliness", "portion size", "menu", "consistency", "dietary accommodations", "crowdiness", "parking", "drinks"]

        this.data = data.map(d => {
            d.date = new Date(d3.timeParse("%Y-%m")(d.date))
            return d;
        })

        this.initVis()
    }


    // Data visualized by Fantastic News by Ian Kelk and Ronan Fonseca
    // https://kelk.ai/fantastic-news/#9thpage + https://observablehq.com/d/880a53d2f9888395 
    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 120};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // time scale
        vis.x = d3.scaleTime()
            .range([0, vis.width])
        
        // move out of update
        vis.x.domain(d3.extent(vis.data, d => d.date));

        // categories
        vis.y = d3.scaleBand()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)

        vis.xGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0," + vis.margin.top * -1 + ")");

        vis.yGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + 0 + ")");

        vis.r = d3.scaleSqrt()
            .range([4,14]);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        
        vis.displayData = vis.data.filter(d => vis.categories.includes(d.category))
        vis.displayData = vis.displayData.filter(d => vis.x(d.date) >= 0 && vis.x(d.date) <= vis.width)
        // console.log(vis.displayData);

        vis.updateVis()
    }
    updateVis() {
        let vis = this;

        if (vis.simulation) vis.simulation.stop();

        vis.r.domain(d3.extent(vis.displayData, d => d.count));
        vis.y.domain(vis.categories);

        vis.yAxis.tickValues(vis.y.domain());
        vis.xAxis.tickFormat(d3.timeFormat("%B, %Y"))
        vis.yGroup.call(vis.yAxis);
        vis.xGroup.call(vis.xAxis);



        if (vis.node) {
            vis.node.remove();
        }
        vis.node = vis.svg.append("g")
            .selectAll("circle")
            .data(vis.displayData)
            .join("circle")
            .attr("cx", d => vis.x(d.date))
            .attr("cy", d => {
                vis.y(d.category) + vis.y.bandwidth() / 2
            })
            .attr("r", d => vis.r(d.count))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", d => vis.color(d.category))
        

        vis.simulation = d3.forceSimulation()
            .force("x", d3.forceX(d => vis.x(d.date)))
            .force("y", d3.forceY(d => vis.y(d.category) + vis.y.bandwidth() / 2))
            .force("collide", d3.forceCollide(d => vis.r(d.count) + 1).strength(0.5));

        vis.simulation.on("tick", () => {
            vis.node
                .transition()
                .delay((d, i) => d.x)
                .ease(d3.easeLinear)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
        });

        const t = vis.svg.transition().duration(400);
        vis.simulation.nodes(vis.data);
        vis.simulation.alpha(1).restart();
    }
}