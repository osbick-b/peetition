
const express = require("express");
const router = express.Router();


const db = require("../database/db");
const mw = require("../route_middleware");
const { compare, hash } = require("../bc");

const { layoutMain, editProfile, logErr } = require("../niftypack");

module.exports = router;

// ======= Middleware ======= //

router.use((req,res,next) => {
  console.log(`${req.method}: ${req.url} in the profile module`);
  next();
});



/////////// PROFILE ROUTES ////////////


// ------------------ GET Profile --------------------- //

router.get("/", mw.requireLoggedIn, (req, res) => {
    return db
        .getProfile(req.session.user_id)
        .then((results) => {
            res.render(
                "user_profile",
                layoutMain("My Profile", results.rows[0])
            );
        })
        .catch((err) => {
            logErr(err, "getting user profile");
        });
});

// ------------------ Set Profile --------------------- //

router.get("/set", mw.requireLoggedIn, (req, res) => {
    res.render("set_profile", layoutMain("Set Profile"));
});

router.post("/set", mw.requireLoggedIn, (req, res) => {
    const { city, age, website } = req.body;
    // +++ VALIDATE URL ---- maybe on DB side?
    return db
        .setProfile(city, age, website, req.session.user_id)
        .then(({ rows }) => {
            return res.redirect(""); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            logErr(err, "registering user");
            return res.render("set_profile", layoutMain("ERROR IN SETPROFILE")); // +++ error handlebar
        });
});

// ------------------ Edit Profile --------------------- //

router.get("/edit", mw.requireLoggedIn, (req, res) => {
    res.render("edit_profile", layoutMain("Edit Profile"));
});

router.post("/edit", mw.requireLoggedIn, (req, res) => {
    editProfile(req)
        .then(({ rows }) => {
            return res.redirect(""); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            logErr(err, "registering user");
            return res.render(
                "edit_profile",
                layoutMain("ERROR IN editPROFILE")
            ); // +++ error handlebar
        });
});
