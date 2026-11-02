
const express = require('express');
const router= express.Router();
const Listing = require('../models/listing.js');
//for error handling

const wrapAsync = require('../utils/wrapAsync.js');


//for authentication before getting page the middleware path
const {isLoggedIn, isOwner,validateListing }= require("../middleware.js");



//for multer
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});// Specify the destination folder for uploaded files


//for mapbox
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


//index route - Search and Category Filtering
router.get("/", wrapAsync(async (req, res) => {

  const { search, category } = req.query;

  let filter = {};

  // Search functionality
  if (search && search.trim() !== "") {

    const searchRegex = new RegExp(
      search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { country: searchRegex }
    ];
  }

  // Category filtering
  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    allListings,
    search: search || "",
    category: category || ""
  });

}));


//new & create  route
router.get("/new",isLoggedIn, (req, res) => {
  res.render("listings/new.ejs" );
});

//can send through hobscotch so need to validate
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {url: url,filename: filename};
    
    newListing.geometry = response.body.features[0].geometry;

    let savedListing =  await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}));

//edit & update route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing  you requested does not exits!");
    
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
}));
//can send through hobscotch so need to validate
router.put("/:id", isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {... req.body.listing });

  if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url: url,filename: filename};
  await listing.save(); 
}
  req.flash("success", "New Listing updated");
  res.redirect(`/listings/${id}`);
}));


//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
}));

//show route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
  if(!listing){
    req.flash("error", "Listing  you requested does not exits!");
    return res.redirect("/listings");
  }
  //console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

module.exports=router;
