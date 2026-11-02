const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review= require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
   url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
        type:Schema.Types.ObjectId,
        ref:"Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true, 
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
  type: String,
  enum: [
    "trending",
    "rooms",
    "iconic-cities",
    "mountains",
    "castles",
    "pools",
    "camping",
    "nature",
    "arctic",
    "beach"
  ],
  required: true
},

});

//post middleware for handling the deletion of the listings
listingSchema.post("findOneAndDelete", async(listing) =>{
if(listing){
    await Review.deleteMany({_id: {$in:listing.reviews}});
}
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;