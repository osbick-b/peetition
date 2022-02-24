const express = require("express");
const router = express.Router();

// ======= Middleware ======= //

router.use((req, res, next) => {
    console.log(`${req.method}: ${req.url} in the profile module`);
    next();
});

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
            // return res.redirect("/thanks"); // ??? is redirecting even if error
            return res.redirect("/thanks"); // *** just for testing of displ sign
        })
        .catch((err) => {
            logErr(err, "registering user");
        });
});