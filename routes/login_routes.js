const express = require("express");
const router = express.Router();

// ======= Middleware ======= //

router.use((req, res, next) => {
    console.log(`${req.method}: ${req.url} in the profile module`);
    next();
});

/////////// LOGIN ROUTES ////////////


// ------------------ GET LOGIN --------------------- //

//---- Login ----//

router.get("/", mw.requireLoggedOut, (req, res) => {
    res.render("login", layoutMain("Login"));
});

router.post("/", mw.requireLoggedOut, (req, res) => {
    const { email, password } = req.body;
    return db
        .getCredentials(email)
        .then((credentials) => {
            const { user_id, saved_pass } = credentials.rows[0];
            return compare(password, saved_pass);
        })
        .then((isMatch) => {
            return isMatch && db.getCookieInfo(email);
        })
        .then(({ rows }) => {
            console.log("from DB >> cookie info at login", rows[0]);
            req.session = rows[0];
            res.redirect("/profile");
        })
        .catch((err) => {
            logErr(err, "logging in");
            return res.render("login", layoutMain("ERROR IN Login")); // +++ error handlebar
        });
});