require("dotenv").config({
    path: require("path").join(__dirname, "../.env")
});
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({
        $or: [
            { geometry: { $exists: false } },
            { "geometry.coordinates": { $exists: false } }
        ]
    });

    console.log(`${listings.length} old listings found`);

    for (const listing of listings) {
        const response = await geocodingClient.forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1
        }).send();

        const feature = response.body.features[0];

        if (!feature) {
            console.log(`Location not found: ${listing.location}`);
            continue;
        }

        listing.geometry = feature.geometry;
        await listing.save();

        console.log(`Updated: ${listing.title}`);
    }

    console.log("Geometry update completed");
}

main()
    .catch((err) => console.log(err))
    .finally(async () => {
        await mongoose.connection.close();
    });
