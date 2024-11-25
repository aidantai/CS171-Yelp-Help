// Functions for cleaning data when loaded from JSONs and filtering
export { cleanBusinesses, cleanReviews, businessFilter, categoryFilter, nameFilter, stateFilter, addCuisine };

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

function cleanReviews(text) {
    let reviews = text
        .split('\n')
        .filter(line => line.trim() !== "")
        .map(line => JSON.parse(line))
        .map((review) => {
            return review;
        })

    return reviews;
}

// Super filter function for filtering across multiple conditions, e.g. cuisine, location, etc.
// Usage:
//     let dennyFilter = businessFilter(["Restaurant"], ["Denny's"]);
//     let allDennys = businesses.filter(dennyFilter)
function businessFilter(categories="all", names="all", states="all") {
    return (business) => {
        // apply all filters to business
        return categoryFilter(categories)(business) && nameFilter(names)(business) && stateFilter(states)(business);
    }
}

function categoryFilter(categories) {
    return (business) => {
        if (categories === "all") return true;

        let hasMatch = false;
        business.categories.forEach(category => {
            if (categories.includes(category)) {
                hasMatch = true;
            }
        })
        return hasMatch;
    }
}

function nameFilter(names) {
    return (business) => {
        if (names === "all") return true;

        return names.includes(business.name);
    }
}

function stateFilter(states) {
    return (business) => {
        if (states === "all") return true;

        // not complete
        // check if longitude and latidude are within the state
        // if in state return true;
        return true;
    }
}

// adds any categories that mark cuisine to business.cuisines
function addCuisine(cuisines) {
    return (business) => {
        business.cuisines = [];
        business.categories.forEach(category => {
            if (cuisines.includes(category)) {
                business.cuisines.push(category);
            }
        })
        return business;
    }
}

// async function streamJSONL(url, cleanFunction, onProcessed) {
//     const response = await fetch(url);
//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();
//     let buffer = '';

//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split('\n');
//         buffer = lines.pop(); // Keep incomplete line

//         const parsedLines = lines
//             .filter(line => line.trim() !== '')
//             .map(line => JSON.parse(line));

//         onProcessed(cleanFunction(parsedLines));
//     }

//     if (buffer.trim()) {
//         onProcessed(cleanFunction([JSON.parse(buffer)]));
//     }
// }