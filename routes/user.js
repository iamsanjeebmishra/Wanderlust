const express = require('express');
const router= express.Router();
const User= require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { route } = require('./listings.js');
const passport = require('passport');
const{saveRedirectUrl}= require("../middleware.js");
//signup route
router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
});


router.post("/signup", wrapAsync( async(req, res)=>{
    try{
    let{username, email, password}= req.body;
    const newUser= new User({email,username});
    const registeredUser= await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            next(err);
        }
    req.flash("success", "welcome to wanderlust");
    res.redirect("/listings");
    })
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
}));




//login route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect:"/login", failureFlash:true}),  wrapAsync(async(req, res)=>{
   
    req.flash("success", "welcome back to wanderlust");
    let redirectUrl= res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

}));


//logout route
router.get("/logout", (req, res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "logged you out");
        res.redirect("/listings");
    });
});

module.exports= router;