const express = require("express");
const router = express.Router();

// ======= Middleware ======= //

router.use((req, res, next) => {
    console.log(`${req.method}: ${req.url} in the profile module`);
    next();
});

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