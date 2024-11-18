function parseJSONL(text) {
    // Split text into lines
    let lines = text.split('\n').filter(line => line.trim() !== "");

    // Parse each line as JSON
    return lines.map(line => JSON.parse(line));
}


// Load data with promises
let promises = [
    d3.text("data/yelp_academic_dataset_business.jsonl")
        .then(parseJSONL),
    // d3.json("data/yelp_academic_dataset_review.json")
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

    let averageStarVis = new BarChart("average-star-vis", businesses);
}
