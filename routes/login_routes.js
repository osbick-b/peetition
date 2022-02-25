const express = require("express");
const router = express.Router();

const db = require("../database/db");
const mw = require("../route_middleware");
const { compare, hash } = require("../bc");

const nf = require("../niftypack");

module.exports = router;


/////////// LOGIN ROUTES ////////////


// ------------------ GET LOGIN --------------------- //

//---- Login ----// ---------- +++ try to refactor it with

router.get("/", mw.requireLoggedOut, (req, res) => {
    res.render("login", nf.layoutMain("Login"));
});

router.post("/", mw.requireLoggedOut, (req, res) => {
    const { email, password } = req.body;
    return db
        .getCredentials(email)
        .then((credentials) => { // check login credentials
            const { user_id, saved_pass } = credentials.rows[0];
            return compare(password, saved_pass);
        })
        .then((isMatch) => { // check credentials and get cookie info
            return isMatch && db.getCookieInfo(email);
        })
        .then(({ rows }) => { // assign session cookie
            console.log("from DB >> cookie info at login", rows[0]);
            req.session = rows[0];
            res.redirect("/profile");
        })
        .catch((err) => {
            logErr(err, "logging in");
            return res.render("login", nf.layoutMain("ERROR IN Login")); // +++ error handlebar
        });
});