
require("dotenv").config({
    path: require("path").join(__dirname, "../.env")
});

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listingsWithGeometry = [];

    for (const obj of initData.data) {
        const response = await geocodingClient.forwardGeocode({
            query: `${obj.location}, ${obj.country}`,
            limit: 1
        }).send();

        const feature = response.body.features[0];

        if (!feature) {
            console.log(`Location not found: ${obj.location}, ${obj.country}`);
            continue;
        }

        listingsWithGeometry.push({
            ...obj,
            owner: "6ae662232679fd8ac325c127",
            geometry: feature.geometry
        });

        console.log(`Geocoded: ${obj.title}`);
    }

    await Listing.deleteMany({});
    await Listing.insertMany(listingsWithGeometry);

    console.log(`Successfully initialized ${listingsWithGeometry.length} listings`);
}

main()
    .catch((err) => console.log(err))
    .finally(async () => {
        await mongoose.connection.close();
    });

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   await Listing.deleteMany({});

//   initData.data = initData.data.map((obj) => ({...obj,owner: "6ae662232679fd8ac325c127",
//   }));
//   await Listing.insertMany(initData.data);
//   console.log("data was initialized");
// };

// initDB();
