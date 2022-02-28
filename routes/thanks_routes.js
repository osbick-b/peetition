const express = require("express");
const router = express.Router();


const db = require("../database/db");
const mw = require("../route_middleware");
const { compare, hash } = require("../bc");

const { layoutMain, editProfile, logErr } = require("../niftypack");

module.exports = router;


/////////// OTHER ROUTES ////////////

// ------------------ GET OTHER --------------------- //
router.get("/", mw.requireLoggedIn, mw.requireHasSigned, (req, res) => {
    db.getCanvasSignature(req.session.user_id)
        .then((results) => {
            // return res.render("testprofile", layoutMain("Test Profile", signature));
            return res.render(
                "thanks",
                layoutMain("Thanks for signing!", results.rows[0])
            );
        })
        .catch((err) => {
            console.log("error in getCanvasSignature", err);
        });
});