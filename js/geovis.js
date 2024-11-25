// main.js

// Dietary restriction options
const restrictionOptions = ['vegan', 'vegetarian', 'gluten_free', 'kosher', 'halal'];

// Category mapping for dietary restrictions
const categoryMapping = {
    vegan: ['vegan'],
    vegetarian: ['vegetarian'],
    gluten_free: ['gluten-free', 'gluten free'],
    kosher: ['kosher'],
    halal: ['halal'],
};

// Initialize the map without settingview yet
const map = L.map('map');

// Add a tile layer (OpenStreetMap tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let markers = L.markerClusterGroup({
    // Customize the cluster icon creation function
    iconCreateFunction: function (cluster) {
        const childCount = cluster.getChildCount();

        // Calculate the size of the cluster icon based on the child count
        const radius = Math.min(40 + childCount * 0.5, 100); // Adjust scaling as needed

        return new L.DivIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'custom-cluster-icon',
            iconSize: new L.Point(radius, radius),
        });
    },
});

// Function to infer dietary restrictions from categories
function inferDietaryFromCategories(categoriesString, restrictions) {
    if (!categoriesString || typeof categoriesString !== 'string') return [];

    const categories = categoriesString
        .split(',')
        .map((cat) => cat.trim().toLowerCase());

    const matchedRestrictions = [];

    restrictions.forEach((restriction) => {
        const keywords = categoryMapping[restriction];
        if (categories.some((cat) => keywords.includes(cat))) {
            matchedRestrictions.push(restriction);
        }
    });

    return matchedRestrictions;
}

// Function to filter data based on selected dietary restrictions
function filterDataByRestrictions(data, restrictions) {
    return data.filter((business) => {
        // Infer dietary restrictions from categories
        const matchedRestrictions = inferDietaryFromCategories(
            business.categories,
            restrictions
        );

        // Return true if any of the selected restrictions are matched
        return matchedRestrictions.length > 0;
    });
}

// Populate the dropdown menu with options and select them by default
const dropdown = document.getElementById('dietaryRestriction');
restrictionOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.text = option.replace('_', ' ').toUpperCase();

    // Select the option by default
    opt.selected = true;

    dropdown.add(opt);
});

// Add event listener for the dropdown menu
dropdown.addEventListener('change', () => {
    updateMap(data);
});

// Load data and initialize the map
let data = [];
d3.text('data/yelp_academic_dataset_business.jsonl')
    .then((rawText) => {
        // Split the text into lines
        const lines = rawText.trim().split('\n');

        // Parse each line as JSON
        data = lines
            .map((line, index) => {
                try {
                    return JSON.parse(line);
                } catch (error) {
                    console.error(`Error parsing JSON on line ${index + 1}:`, error);
                    return null; // Exclude this line from the data
                }
            })
            .filter((d) => d !== null); // Remove any null entries

        console.log('Loaded Data:', data);
        updateMap(data);
    })
    .catch((error) => {
        console.error('Error loading data:', error);
    });

function updateMap(data) {
    const selectedOptions = Array.from(
        document.getElementById('dietaryRestriction').selectedOptions
    ).map((option) => option.value);

    console.log(`Selected Dietary Restrictions: ${selectedOptions}`);

    // Clear existing markers
    markers.clearLayers();

    // Filter data based on selected restrictions
    const filteredData = filterDataByRestrictions(data, selectedOptions);

    console.log(`Filtered Data:`, filteredData);

    // Check if data is available
    if (filteredData.length === 0) {
        alert('No businesses found for the selected dietary restrictions.');
        return;
    }

    // Create a LatLngBounds object to store the bounds
    const bounds = L.latLngBounds();

    // Add markers to the cluster group
    filteredData.forEach((business) => {
        const lat = business.latitude;
        const lon = business.longitude;

        if (!isNaN(lat) && !isNaN(lon)) {
            // Create a marker for the business
            const marker = L.marker([lat, lon]);

            // Bind a popup with business details
            marker.bindPopup(`
        <strong>${business.name}</strong><br>
        ${business.address}<br>
        ${business.city}, ${business.state} ${business.postal_code}<br>
        <strong>Stars:</strong> ${business.stars}<br>
        <strong>Review Count:</strong> ${business.review_count}
      `);

            markers.addLayer(marker);

            // Extend the bounds to include this marker's position
            bounds.extend([lat, lon]);
        } else {
            console.warn(`Invalid coordinates for business ${business.name}: [${lat}, ${lon}]`);
        }
    });

    // Add the cluster group to the map
    map.addLayer(markers);

    // Fit the map view to the bounds of the data
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        // Set a default view if bounds are not valid
        map.setView([37.8, -96], 4);
    }
}
