const express = require("express");
const router = express.Router();

const db = require("../database/db");
const mw = require("../route_middleware");
const { compare, hash } = require("../bc");

const { layoutMain, editProfile, logErr } = require("../niftypack");

module.exports = router;


/////////// SIGN ROUTES ////////////

// ------------------ GET SIGN --------------------- //
// ---- Sign ---- //

router.get("/", mw.requireLoggedIn, mw.requireNotSigned, (req, res) => {
    res.render("sign", layoutMain("Sign now!"));
});

router.post("/", mw.requireLoggedIn, mw.requireNotSigned, (req, res) => {
    const { signature } = req.body;
    
    // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
    // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // res.setHeader("X-Frame-Options", "DENY");

    return db
        .signPetition(signature, req.session.user_id) // +++ gotta check for if user has really signed canvas. prob not here
        .then((results) => {
            console.log("user has signed", results.rows[0]);
            req.session.has_signed = true;
            return res.redirect("/thanks"); // *** just for testing of displ sign
        })
        .catch((err) => {
            logErr(err, "registering user");
        });
});
            
