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

/////////// REGISTER ROUTES ////////////

// ------------------ GET REGISTER --------------------- //


//---- Register ----//

router.get("/", mw.requireLoggedOut, (req, res) => {
    res.render("register", layoutMain("Register"));
});

router.post("/", mw.requireLoggedOut, (req, res) => {
    const { first, last, email, password, passconfirm } = req.body;
    return password === "" || password !== passconfirm
        ? res.render("register", layoutMain("INVALID PASS")) // +++ error handlebar
        : hash(password)
              .then((hashedPass) => {
                  return db.registerUser(first, last, email, hashedPass);
              })
              .then((results) => {
                  req.session = results.rows[0]; // getting from db --> id, first, last
                  return res.redirect("/sign");
              })
              .catch((err) => {
                  logErr(err, "registering user");
                  return res.render(
                      "register",
                      layoutMain("ERROR IN REGISTER")
                  ); // +++ error handlebar
              });
});
