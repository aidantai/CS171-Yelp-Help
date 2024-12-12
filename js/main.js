// use functions from handledata.js
import {cleanBusinesses, cleanReviews, businessFilter, addCuisine} from "./handledata.js";
import {BarCuisine} from "./barchart.js";
import {PieReviews} from "./piechart.js";
import { WordCloud } from "./wordcloud.js";
import {BubbleVis} from "./bubblevis.js";
import { Timeline } from "./timeline.js";
import {handleRankingButton} from "./ranking.js";
import { Areachart } from "./areachart.js";
import { QuizBar } from "./quizbar.js";
export {updateCuisineVis};

handleRankingButton(false);
let bubbleVis, timeline;
// filter updated by quiz
let quizFilter = businessFilter();
let quizbarchart;

// Load data with promises
// Review data is 5gb, too large to load into memory with d3.text.
let promises = [
    d3.text("data/yelp_academic_dataset_business.jsonl")
        .then(cleanBusinesses),
    d3.text("data/yelp_academic_dataset_review_top25.jsonl")
        .then(cleanReviews),
    d3.json("data/yelp_academic_dataset_cuisines_reduced.json"),
    d3.json("data/wordcloud_top25.json"),
    d3.json("data/rev_t10_categ_dated.json")
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
    let reviewcloud = data[3];
    let reviews_dated = data[4];
    console.log("Number of businesses:", businesses.length);
    console.log("Number of reviews:", reviews.length);
    console.log("Number of cuisines:", cuisines);

    // List of all known cuisines for some basic cuisine visualizations
    // let cuisineList = ["Chinese", "Japanese", "Korean", "Thai", "Vietnamese", "Indian", "French", "Italian", "Mexican", "Spanish", "Middle Eastern", "Mediterranean", "American", "African", "Caribbean", "Latin American", "Brazilian", "Cuban", "Hawaiian", "Filipino", "British", "Irish", "Scottish", "German", "Greek", "Turkish", "Russian", "Eastern European", "Central European", "Scandinavian", "Austrian", "Belgian", "Swiss", "Dutch", "Portuguese"]
    // just grab keys from cuisines as an array
    let cuisineList = Object.keys(cuisines).slice(0, 10);
    console.log(cuisineList);
    // Filters for all business that offer a particular cuisine
    let allcuisineFilter = businessFilter(cuisineList)
    let cuisineAdder = addCuisine(cuisineList)
    let cuisineBusinesses = businesses.filter(allcuisineFilter).map(cuisineAdder);
    // console.log(cuisineFilter);
    console.log(cuisineBusinesses);

    // Create visualizations
    cuisineVis = new BarCuisine("cuisine-vis", cuisineBusinesses, "#cuisine-dep");
    // let cuisineCountVis = new BarCuisine("cuisine-count-vis", cuisineBusinesses, "Number of Restaurants by Cuisine", (leaves)=>leaves.length);
    // let averageStarVis = new BarCuisine("average-star-vis", cuisineBusinesses, "Average Star Rating by Cuisine", (leaves)=>d3.mean(leaves, d=>d.stars));
    // let reviewCountVis = new BarCuisine("review-count-vis", cuisineBusinesses, "Review Count by Cuisine", (leaves)=>d3.mean(leaves, d=>d.review_count));

    let reviewcountvis = new Areachart("review-count-vis", reviews_dated);
    let wordcloud = new WordCloud("wordcloud-vis", reviewcloud);
    let reviewVis = new PieReviews("review-vis", reviewcloud);
    timeline = new Timeline("timeline-vis", reviews_dated, brushed);
    bubbleVis = new BubbleVis("bubble-vis", reviews_dated);

    
    // let quizCuisines = ["Italian"];
    // let quizPrices = [2];
    // let quizRestrictions = ["vegetarian"];
    // let quizAmbiences = ["romantic"];
    let quizBusinesses = businesses.filter(quizFilter);
    console.log(quizBusinesses);
    console.log(quizBusinesses);
    quizBusinesses = businesses.filter(quizFilter);
    console.log(quizBusinesses)

    quizbarchart = new QuizBar("quiz-bar-vis", businesses, quizFilter);


}

function updateCuisineVis() {
    console.log("Updating cuisine vis");
    let dependentVar = d3.select("#cuisine-dep").property("value");
    console.log(dependentVar)
    cuisineVis.wrangleData(dependentVar);
}

window.updateCuisineVis = updateCuisineVis;
window.handleRankingButton = handleRankingButton;
window.updateQuiz = updateQuiz;

let brushed = function () {

	// TO-DO: React to 'brushed' event

	// Get the extent of the current brush
	let selectionRange = d3.brushSelection(d3.select(".brush").node());

	// Convert the extent into the corresponding domain values
	let selectionDomain = selectionRange.map(timeline.x.invert);


	bubbleVis.x.domain(d3.extent(selectionDomain));
	bubbleVis.wrangleData();

}

function updateQuiz() {
    // Quiz
    // Filter on Cuisines
    // Filter on Price Range
    // Filter on Dietary Restrictions
    // let quizPrices = [document.getElementById("quiz-price")];
    // let quizRestrictions = document.getElementById("quiz-restrictions");
    // let quizAmbiences = document.getElementById("quiz-ambience");
    console.log("updating quiz");
    let quizCuisines = "all"
    let quizPrices = "all";
    let quizRestrictions = "all";
    let quizAmbiences = "all";
    let cuisine = String(d3.select("#cuisine").property("value"))
    quizCuisines = Array.from([cuisine])
    if (cuisine == "all") quizCuisines = "all";
    if (cuisine === "American") {
        quizCuisines = ["American (Traditional)", "American (New)"];
    }

    let price = d3.select('input[name="price-radio"]:checked')
    if (price != null && price != [null]) {
        console.log(price)
        try {
            quizPrices = [price.property("value")]
            if (price.property("value") == "all") quizPrices = "all";
        } catch {
            quizPrices = "all"
        }
        
    }
    if (quizPrices == ["all"]) quizPrices = "all";
    console.log(price);

    let restrictions = d3.selectAll('input[name="diet-check"]:checked')
    let checkedRestrictions = []
    if (restrictions != null && restrictions != [] && restrictions != [null]) {
        restrictions.each( function() {
            checkedRestrictions.push(this.value)
        }
        )
    }
    console.log(checkedRestrictions)
    if (checkedRestrictions.length == 0) {
        quizRestrictions = "all";
    } else {
        quizRestrictions = Array.from(checkedRestrictions);
    }
    restrictions.each(function() {
        console.log(this.value);
    })
    // console.log(Object.keys(restrictions));
    // console.log(restrictions._groups);
    // if (restrictions) {
    //     quizRestrictions = []
    //     restrictions._groups.forEach(d => {
    //         quizRestrictions.push(d.property("value"));
    //     })
    // }
    // console.log(quizRestrictions)

    
    // let quizCuisines = [d3.select("#cuisine").property("value")];

    // let ambience = String(d3.select("#ambience").property("value"))
    // quizAmbiences = Array.from([ambience])
    // if (ambience == "all") quizAmbiences = "all";

    if (quizCuisines == ["all"]) quizCuisines = "all";
    // if (quizAmbiences == ["all"]) quizAmbiences = "all";
    console.log(quizCuisines, quizPrices, quizRestrictions, quizAmbiences)
    quizFilter = businessFilter(quizCuisines, quizPrices, quizRestrictions, "all");

    console.log(quizFilter);

    if (quizbarchart) {
        quizbarchart.wrangleData(quizFilter);
    }
}