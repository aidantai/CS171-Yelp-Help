// bubblevis.js

import { formatFactorName } from "./handledata.js";

export class BubbleVis {
    /**
     * Creates an instance of BubbleVis.
     * @param {string} parentElement - The ID of the parent container.
     * @param {Array} aggregatedData - The aggregated sentiment data.
     */
    constructor(parentElement, aggregatedData) {
        this.parentElement = parentElement;
        this.aggregatedData = aggregatedData;
        this.initVis();
    }

    /**
     * Initializes the visualization by setting up the SVG, scales, and rendering bubbles.
     */
    initVis() {
        const vis = this;

        // Select the SVG element
        vis.svg = d3.select(`#${vis.parentElement} svg`);
        if (vis.svg.empty()) {
            console.error(`SVG element not found within #${vis.parentElement}`);
            return;
        }
        vis.width = +vis.svg.attr('width');
        vis.height = +vis.svg.attr('height');

        // Define margins
        vis.margin = { top: 50, right: 150, bottom: 50, left: 150 };

        // Define inner width and height
        vis.innerWidth = vis.width - vis.margin.left - vis.margin.right;
        vis.innerHeight = vis.height - vis.margin.top - vis.margin.bottom;

        // Append a group element to SVG
        vis.chartGroup = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Define color scale
        vis.colorScale = d3.scaleOrdinal()
            .domain(['positive', 'neutral', 'negative'])
            .range(['#28a745', '#ffc107', '#dc3545']); // Green, Yellow, Red

        // Define size scale (radius)
        vis.sizeScale = d3.scaleSqrt()
            .range([20, 80]); // Adjusted sizes for better visibility

        // Initialize tooltip
        vis.tooltip = d3.select('#tooltip');

        // Initialize modal elements
        vis.modal = d3.select('#detail-modal');
        vis.modalContent = d3.select('#modal-content');
        vis.closeModal = d3.select('#close-modal');
        vis.closeModal.on('click', () => vis.modal.style('display', 'none'));
        window.onclick = function(event) {
            if (event.target.id === 'detail-modal') {
                vis.modal.style('display', 'none');
            }
        };

        // Update scales
        const maxCount = d3.max(vis.aggregatedData, d => d.count);
        vis.sizeScale.domain([0, maxCount || 1]); // Prevent domain from being [0, undefined]

        // Render the bubbles
        vis.renderBubbles();

        // Add a legend for sentiment colors
        vis.addLegend();
    }

    /**
     * Renders the bubble chart based on aggregated sentiment data.
     */
    renderBubbles() {
        const vis = this;

        // Bind data
        const bubbles = vis.chartGroup.selectAll('.bubble')
            .data(vis.aggregatedData, d => d.sentiment);

        // Enter new bubbles
        bubbles.enter()
            .append('circle')
            .attr('class', 'bubble')
            .attr('cx', vis.innerWidth / 2) // Start from center for animation
            .attr('cy', vis.innerHeight / 2)
            .attr('r', 0)
            .attr('fill', d => vis.colorScale(d.sentiment))
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => vis.handleMouseOver(event, d))
            .on('mouseout', () => vis.handleMouseOut())
            .on('click', (event, d) => vis.handleClick(event, d))
            .transition()
            .duration(1000)
            .attr('cx', (d, i) => (i + 1) * (vis.innerWidth / (vis.aggregatedData.length + 1)))
            .attr('r', d => vis.sizeScale(d.count));

        // Update existing bubbles
        bubbles.transition()
            .duration(1000)
            .attr('cx', (d, i) => (i + 1) * (vis.innerWidth / (vis.aggregatedData.length + 1)))
            .attr('r', d => vis.sizeScale(d.count))
            .attr('fill', d => vis.colorScale(d.sentiment));

        // Exit old bubbles
        bubbles.exit()
            .transition()
            .duration(500)
            .attr('r', 0)
            .remove();

        // Add labels to bubbles
        vis.chartGroup.selectAll('.bubble-label')
            .data(vis.aggregatedData, d => d.sentiment)
            .join(
                enter => enter.append('text')
                    .attr('class', 'bubble-label')
                    .attr('x', (d, i) => (i + 1) * (vis.innerWidth / (vis.aggregatedData.length + 1)))
                    .attr('y', vis.innerHeight / 2)
                    .attr('dy', '.35em')
                    .attr('text-anchor', 'middle')
                    .text(d => `${capitalize(d.sentiment)}: ${d.count}`)
                    .style('font-size', '14px')
                    .style('fill', '#fff'),
                update => update
                    .transition()
                    .duration(1000)
                    .attr('x', (d, i) => (i + 1) * (vis.innerWidth / (vis.aggregatedData.length + 1)))
                    .attr('y', vis.innerHeight / 2)
                    .text(d => `${capitalize(d.sentiment)}: ${d.count}`)
                    .style('font-size', '14px')
                    .style('fill', '#fff'),
                exit => exit.remove()
            );
    }

    /**
     * Updates the visualization with new aggregated data.
     */
    updateVis() {
        const vis = this;

        // Update scales based on new data
        const maxCount = d3.max(vis.aggregatedData, d => d.count);
        vis.sizeScale.domain([0, maxCount || 1]);

        // Render the bubbles with new data
        vis.renderBubbles();
    }

    /**
     * Handles mouseover events on bubbles to display tooltips.
     * @param {Event} event - The mouseover event.
     * @param {Object} d - The data object associated with the bubble.
     */
    handleMouseOver(event, d) {
        console.log("Mouse over the buble: ", d)
        const vis = this;
        vis.tooltip.style('visibility', 'visible')
            .html(`
                <strong>Sentiment:</strong> ${capitalize(d.sentiment)}<br/>
                <strong>Number of Reviews:</strong> ${d.count}<br/>
                <strong>Average Stars:</strong> ${d.avg_stars.toFixed(2)}
            `)
            .style('top', `${event.pageY - 50}px`)
            .style('left', `${event.pageX + 20}px`);
    }

    /**
     * Handles mouseout events to hide tooltips.
     */
    handleMouseOut() {
        console.log("Mouse out of the buble: ")
        const vis = this;
        vis.tooltip.style('visibility', 'hidden');
    }

    /**
     * Handles click events on bubbles to display detailed information in a modal.
     * @param {Event} event - The click event.
     * @param {Object} d - The data object associated with the bubble.
     */
    handleClick(event, d) {
        console.log("Clicked bubble:", d);
        const vis = this;
        vis.modalContent.html(`
            <span id="close-modal">&times;</span>
            <h3>${capitalize(d.sentiment)} Sentiment</h3>
            <p><strong>Number of Reviews:</strong> ${d.count}</p>
            <p><strong>Average Stars:</strong> ${d.avg_stars.toFixed(2)}</p>
            <!-- Additional detailed information can be added here -->
        `);
        vis.modal.style('display', 'block');

        // Re-attach the close event to the new close button inside the modal
        vis.closeModal = d3.select('#close-modal');
        vis.closeModal.on('click', () => vis.modal.style('display', 'none'));
    }

    /**
     * Adds a legend to the visualization to indicate sentiment colors.
     */
    addLegend() {
        const vis = this;

        // Remove existing legend if any
        vis.chartGroup.selectAll('.legend').remove();

        const sentiments = ['positive', 'neutral', 'negative'];
        const legend = vis.chartGroup.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.innerWidth - 150}, -30)`);

        sentiments.forEach((sentiment, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            legendRow.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', vis.colorScale(sentiment));

            legendRow.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .text(sentiment.charAt(0).toUpperCase() + sentiment.slice(1))
                .style('font-size', '12px')
                .attr('alignment-baseline', 'middle');
        });
    }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} Capitalized string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
