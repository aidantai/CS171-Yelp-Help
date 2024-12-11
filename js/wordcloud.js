export { WordCloud };

class WordCloud {
    
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`);

        vis.layout = d3.layout.cloud()
            .size([vis.width, vis.height])
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90) // Rotate 0 or 90 degrees randomly
            .font("Arial")
            .fontSize(d => d.size)
            .on("end", words => {
                console.log(words);
                vis.updateVis(words);
            });

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
    
        // Step 1: Transform vis.data into an array of { text, size }
        vis.displayData = Object.entries(vis.data).map(([text, size]) => ({
            text: String(text), // Ensure text is a string
            size: Math.sqrt(size) * .3
        }));
    
        console.log("Display Data (All Words):", vis.displayData); // Debug: Check all words are included
    
        // Step 2: Assign the transformed data to the layout
        vis.layout.words(vis.displayData);
    
        // Step 3: Start the layout computation
        vis.layout.start();
        console.log("Layout computation started"); // Debugging log
    }
    

    updateVis(words) {

        console.log(words);

        
        

        let vis = this;

        // Clear the previous word cloud
        vis.svg.selectAll("text").remove();

        // Draw words
        vis.svg.selectAll("text")
            .data(words)
            .join("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Arial")
            .style("fill", d => vis.color(d.text)) // Random color
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
            .text(d => d.text);
    }
}