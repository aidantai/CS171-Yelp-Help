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


// Load data with promises
let promises = [
    d3.text("data/yelp_academic_dataset_business.jsonl")
        .then(cleanBusinesses),
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

    let cuisineCountVis = new BarCuisine("cuisine-count-vis", businesses, "Number of Restaurants by Cuisine", (leaves)=>leaves.length);
    let averageStarVis = new BarCuisine("average-star-vis", businesses, "Average Star Rating by Cuisine", (leaves)=>d3.mean(leaves, d=>d.stars));
}
