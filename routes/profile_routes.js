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
        .getCookieById(req.session.user_id)
        .then((results) => {
            req.session = results.rows[0];
            return db.getProfile(req.session.user_id);
        })

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
    // console.log("newUser AFTER", req.session.newUser);
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
    const urlNotValid = req.body.website && !req.body.website.startsWith("http://" || "https://");
    const passNotValid = req.body.password !== "" && req.body.password !== req.body.passconfirm;
    console.log("urlNotValid, passNotValid", urlNotValid, passNotValid);
       urlNotValid || passNotValid
            ? res.render("profile_edit", layoutMain("ERROR IN UPDATE PROFILE")) // +++ ADD error handlebar
            : editProfile(req);
        return res.redirect("/profile"); // !!! PROBLEM is here --- headers have been sent already i think.
  });

router.get(
    "/deletesignature",
    mw.requireLoggedIn,
    mw.requireHasSigned,
    (req, res) => {
        res.render("profile_deletesign", layoutMain("Are you sure?"));
    }
);

router.get(
    "/deletesignature/delete",
    mw.requireLoggedIn,
    mw.requireHasSigned,
    (req, res) => {
        return db
            .deleteSignature(req.session.user_id)
            .then((results) => {
                //  console.log("signature should have been deleted");
                //  console.log("res.rows0", results.rows[0]);
                req.session.has_signed = false;
                return res.redirect("/profile");
            })
            .catch((err) => {
                logErr(err, "deleting signature");
            });
    }
);
