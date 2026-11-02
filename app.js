require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; 
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
//for error handling
const ExpressError = require('./utils/ExpressError.js');
//for session handling
const session= require("express-session");
//for flash
const flash= require("connect-flash");
//for router
const listingsRouter= require("./routes/listings.js")
const reviewsRouter= require("./routes/reviews.js")
const userRouter= require("./routes/user.js");
//for passport
const passport= require("passport");
const LocalStrategy= require("passport-local").Strategy;
const User= require("./models/user.js");







//for using PUT and DELETE methods in forms
app.use(methodOverride('_method'));

main().then(
    () =>{
    console.log('Connected to MongoDB')
})


 



.catch((err) => {
    console.log(err)
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

//for views
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

//for parsing form data from the request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//for ejs-mate layouts
app.engine('ejs', ejsMate);
//for serving static files
app.use(express.static(path.join(__dirname, '/public')));


//session options
const sessionOptions={
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
    },

};
app.use(session(sessionOptions));

//for flash 
app.use(flash());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//for passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Global variables for EJS
app.use((req, res, next)=>{
    res.locals.successMsg= req.flash("success");
    res.locals.errorMsg= req.flash("error");
    res.locals.currUser= req.user;
    next();
});





// //create a demo user
// app.get("/demouser", async(req, res)=>{
//     let fakeUser= new User({
//         email:"student",
//         username: "apna-student",

//     });
//    let registeredUser= await User.register(fakeUser, "helloworld");
//    res.send(registeredUser);
// })







// app.get("/", (req, res) => {
//     res.send("welcome to wanderlust");
// });





//routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);



// //if any of above routes not match then
// app.all("/*splat", (req, res, next) => {
//     next(new ExpressError( 404, "Page Not Found"));
// });

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong!";
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});



// //testing the listing model
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });