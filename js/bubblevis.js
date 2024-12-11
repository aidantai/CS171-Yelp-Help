export {BubbleVis};

class BubbleVis {


    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;

        // this.categories = ["food", "service", "price", "ambiance", "wait", "cleanliness", "portion size", "menu", "consistency", "dietary accommodations", "customer interaction", "crowdiness", "parking", "drinks", "reservations", "authenticity", "special events", "staff knowledge", "technology"]
        this.categories = ["food", "service", "price", "ambiance", "wait", "cleanliness", "portion size", "menu", "consistency", "dietary accommodations", "crowdiness", "parking", "drinks"]


        this.initVis()
    }


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
        vis.x = d3.scaleLinear()
            .range([0, vis.width])

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
            .range([5,15]);

        vis.colour = d3.scaleOrdinal(d3.schemeTableau10);

        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => {
            d.date = d3.isoParse(d.date);
            return d;
        }).filter(d => vis.categories.includes(d.category))
        // console.log(vis.displayData);

        vis.updateVis()
    }
    updateVis() {
        let vis = this;

        if (vis.simulation) vis.simulation.stop();

        vis.r.domain(d3.extent(vis.data, d => d.count));
        vis.x.domain(d3.extent(vis.data, d => d.date));
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
            .attr("fill", d => vis.colour(d.category))
        
        


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