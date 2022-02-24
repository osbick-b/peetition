const express = require("express");
const router = express.Router();


const db = require("../database/db");
const mw = require("../route_middleware");
const { compare, hash } = require("../bc");

const { layoutMain, editProfile, logErr } = require("../niftypack");

module.exports = router;

// ======= Middleware ======= //

router.use((req, res, next) => {
    console.log(`${req.method}: ${req.url} in the profile module`);
    next();
});

/////////// Signers ROUTES ////////////

// ------------------ GET Signers --------------------- //

router.get("/", (req, res) => {
    db.getListSigners()
        .then(({ rows }) => {
            res.render("signerslist", layoutMain("List of Signers", rows));
        })
        .catch((err) => {
            logErr(err, "getting signers list");
        });
});

router.get("/:city", (req, res) => {
    db.getSignersByCity(req.params.city)
        .then(({ rows }) => {
            console.log("from DB --- rows by city", rows);
            res.render(
                "signersbycity",
                layoutMain(`List of signers in ${rows}`, rows)
            );
        })
        .catch((err) => {
            logErr(err, "getting signers by city");
        });
});