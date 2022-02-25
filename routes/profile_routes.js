const express = require("express");
const router = express.Router();

const db = require("../database/db");
const { compare, hash } = require("../bc");
const mw = require("../route_middleware");

const { layoutMain, editProfile, logErr } = require("../niftypack");

module.exports = router;

/////////// PROFILE ROUTES ////////////

// ------------------ Profile --------------------- //

router.get("/", mw.requireLoggedIn, (req, res) => {
    return db
        .getProfile(req.session.user_id)
        .then((results) => {
            res.render("profile", layoutMain("My Profile", results.rows[0]));
        })
        .catch((err) => {
            logErr(err, "getting user profile");
        });
});

// ------------------ Set Profile --------------------- //

router.get("/set", mw.requireLoggedIn, (req, res) => {
    req.session.newUser
        ? res.render("profile_set", layoutMain("Set Profile"))
        : res.redirect("/profile/edit");
    req.session.newUser = null;
    console.log("newUser AFTER", req.session.newUser);
});

router.post("/set", mw.requireLoggedIn, (req, res) => {
    const { city, age, website } = req.body;
    // +++ VALIDATE URL ---- ux: hint that input has to be with http etc --- val ALSO on DB side!!
    return db
        .setProfile(city, age, website, req.session.user_id) // +++ validate input
        .then(({ rows }) => {
            return res.redirect("/sign"); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            logErr(err, "setting user profile");
            return res.render("profile_set", layoutMain("ERROR IN SETPROFILE")); // +++ error handlebar
        });
});

// ------------------ Edit Profile --------------------- //

router.get("/edit", mw.requireLoggedIn, (req, res) => {
    return db
        .getProfile(req.session.user_id)
        .then((results) => {
            res.render(
                "profile_edit",
                layoutMain("Edit Profile", results.rows[0])
            );
        })
        .catch((err) => {
            logErr(err, "getting edit profile");
        });
});

router.post("/edit", mw.requireLoggedIn, (req, res) => {
    editProfile(req) // +++ validate input --- go to nif
        .then((responseObj) => {
            console.log(">>> editProfile END -- responseObj >> ", responseObj);
            // setting cookie with updated info:
            req.session.first = responseObj.first;
            req.session.last = responseObj.last;
            //// !!!! FIRST EDIT PROFILE then DO THE COOKIE THING. refactor later if wanted
            console.log("req.session after qpplying neq data", req.session);
            return res.redirect("/profile");
        })
        .catch((err) => {
            logErr(err, "editing profile");
            return res.render(
                "profile_edit",
                layoutMain("ERROR IN editPROFILE")
            ); // +++ error handlebar
        });
});
