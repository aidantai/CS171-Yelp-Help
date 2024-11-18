async function streamJSONL(url, cleanFunction, onProcessed) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line

        const parsedLines = lines
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));

        onProcessed(cleanFunction(parsedLines));
    }

    if (buffer.trim()) {
        onProcessed(cleanFunction([JSON.parse(buffer)]));
    }
}



function cleanBusinesses(text) {
    // Split text into lines, then parse into JSONs
    let businesses = text
        .split('\n')
        .filter(line => line.trim() !== "")
        .map(line => JSON.parse(line))
        .map((business) => {
            let categories = business["categories"];
            if (categories === undefined || categories === null) {
                categories = [];
            } else {
                categories = categories.split(", ");
            }
            business["categories"] = categories;

            let name = business["name"];
            if (name === undefined || name === null) {
                name = "";
            }
            business["name"] = name;

            return business;
        })


    return businesses;
}


function cleanReviews(reviews) {
    return reviews.map(review => {
        return review;
    })
}


// Load data with promises
// Review data is 5gb, too large to load into memory with d3.text.
let promises = [
    d3.text("data/yelp_academic_dataset_business.jsonl")
        .then(cleanBusinesses)
];

// Handle data error
Promise.all(promises)
    .then(function (data) {
        initMain(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// Initialize main page
function initMain(data) {

    // Log data
    console.log("Promised data: ", data);
    let businesses = data[0];
    // let reviews = data[1];

    console.log("Number of businesses:", businesses.length);
    // console.log("Number of reviews:", reviews.length);

    let cuisineCountVis = new BarCuisine("cuisine-count-vis", businesses, "Number of Restaurants by Cuisine", (leaves)=>leaves.length);
    let averageStarVis = new BarCuisine("average-star-vis", businesses, "Average Star Rating by Cuisine", (leaves)=>d3.mean(leaves, d=>d.stars));
    let reviewCountVis = new BarCuisine("review-count-vis", businesses, "Review Count by Cuisine", (leaves)=>d3.mean(leaves, d=>d.review_count));
    // let reviewVis = new BarReviews("review-vis", "Review Count by Date");

    // streamJSONL("data/yelp_academic_dataset_review.jsonl", cleanReviews, chunk => {
    //     reviewVis.updateVis(chunk);
    // })
}
