// use functions from handledata.js
import {cleanBusinesses, cleanReviews, businessFilter, addCuisine} from "./handledata.js";
import {BarCuisine} from "./barchart.js";
import {PieReviews} from "./piechart.js";
export {updateCuisineVis};

// Load data with promises
// Review data is 5gb, too large to load into memory with d3.text.
let promises = [
    d3.text("data/yelp_academic_dataset_business.jsonl")
        .then(cleanBusinesses),
    d3.text("data/yelp_academic_dataset_review_top25.jsonl")
        .then(cleanReviews),
    d3.json("data/yelp_academic_dataset_cuisines_reduced.json")
];

// Handle data error
Promise.all(promises)
    .then(function (data) {
        initMain(data)
    })
    .catch(function (err) {
        console.log(err)
    });

let cuisineVis;

// Initialize main page
function initMain(data) {

    // Log data
    console.log("Promised data: ", data);
    let businesses = data[0];
    let reviews = data[1];
    let cuisines = data[2];
    console.log("Number of businesses:", businesses.length);
    console.log("Number of reviews:", reviews.length);
    console.log("Number of cuisines:", cuisines);

    // List of all known cuisines for some basic cuisine visualizations
    // let cuisineList = ["Chinese", "Japanese", "Korean", "Thai", "Vietnamese", "Indian", "French", "Italian", "Mexican", "Spanish", "Middle Eastern", "Mediterranean", "American", "African", "Caribbean", "Latin American", "Brazilian", "Cuban", "Hawaiian", "Filipino", "British", "Irish", "Scottish", "German", "Greek", "Turkish", "Russian", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese"]
    // just grab keys from cuisines as an array
    let cuisineList = Object.keys(cuisines).slice(0, 10);
    console.log(cuisineList);
    // Filters for all business that offer a particular cuisine
    let cuisineFilter = businessFilter(cuisineList)
    let cuisineAdder = addCuisine(cuisineList)
    let cuisineBusinesses = businesses.filter(cuisineFilter).map(cuisineAdder);
    // console.log(cuisineFilter);
    console.log(cuisineBusinesses);

    // Create visualizations
    cuisineVis = new BarCuisine("cuisine-vis", cuisineBusinesses, "#cuisine-dep");
    // let cuisineCountVis = new BarCuisine("cuisine-count-vis", cuisineBusinesses, "Number of Restaurants by Cuisine", (leaves)=>leaves.length);
    // let averageStarVis = new BarCuisine("average-star-vis", cuisineBusinesses, "Average Star Rating by Cuisine", (leaves)=>d3.mean(leaves, d=>d.stars));
    // let reviewCountVis = new BarCuisine("review-count-vis", cuisineBusinesses, "Review Count by Cuisine", (leaves)=>d3.mean(leaves, d=>d.review_count));

    let reviewVis = new PieReviews("review-vis", reviews);
}

function updateCuisineVis() {
    console.log("Updating cuisine vis");
    let dependentVar = d3.select("#cuisine-dep").property("value");
    console.log(dependentVar)
    cuisineVis.wrangleData(dependentVar);
}

window.updateCuisineVis = updateCuisineVis;

