export { PieReviews };

class PieReviews {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.title = "Primary Concern Behind Review"
        this.circleColors = ["#FFC300", "#FF5733", "#C70039"];

        // this.parseDate = d3.timeParse("%m/%d/%Y");
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

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.title)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        vis.pieChartGroup = vis.svg.append('g')
            .attr('class', 'pie-chart')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height / 2})`);

        vis.pie = d3.pie()
            .value(d => d.value)

        vis.outerRadius = vis.width / 2;
        vis.innerRadius = 0;

        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .attr('id', 'pie-tooltip')

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        console.log(vis.data);
        // Bad algorithm to extract sentiment from review text
        let service_count = 0;
        let food_count = 0;
        let price_count = 0;
        
        vis.data.forEach(review => {
            if (review.text.includes("service")) {
                service_count++;
            }
            if (review.text.includes("food")) {
                food_count++;
            }
            if (review.text.includes("price")) {
                price_count++;
            }
        })
        let sentiments = ["Service", "Food", "Price"];
        let sentiment_counts = [service_count, food_count, price_count];


        vis.displayData = []
        console.log(sentiments);
        sentiments.forEach((sentiment, i) => {
            console.log(sentiment)
            vis.displayData.push({
                value: sentiment_counts[i],
                color: vis.circleColors[i],
                sentiment: sentiments[i]
            })
        })
        console.log(vis.displayData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        vis.arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData))
            .join("path")
            .attr("d", vis.arc)
            .style("fill", function(d, i) { return vis.circleColors[i]; })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)');

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>Reviews on ${d.data.sentiment}<h3>
                             <h4> value: ${d.value}</h4>      
                             <h4> startAngle: ${d.startAngle}</h4>
                             <h4> endAngle: ${d.endAngle}</h4>   
                             <h4> data: ${JSON.stringify(d.data)}</h4>                         
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });



    }



}