
const express = require("express");
const router = express.Router();

// ======= Middleware ======= //

router.use((req,res,next) => {
  console.log(`${req.method}: ${req.url} in the profile module`);
  next();
});


/////////// PROFILE ROUTES ////////////


// ------------------ GET Profile --------------------- //

router.get("/profile", mw.requireLoggedIn, (req, res) => {
    return db
        .getProfile(req.session.user_id)
        .then((results) => {
            res.render(
                "user_profile",
                layoutMain("My Profile", results.rows[0])
            );
        })
        .catch((err) => {
            logErr(err, "getting user profile");
        });
});

// ------------------ Set Profile --------------------- //

router.get("/setprofile", mw.requireLoggedIn, (req, res) => {
    res.render("set_profile", layoutMain("Set Profile"));
});

app.post("/setprofile", mw.requireLoggedIn, (req, res) => {
    const { city, age, website } = req.body;
    // +++ VALIDATE URL ---- maybe on DB side?
    return db
        .setProfile(city, age, website, req.session.user_id)
        .then(({ rows }) => {
            return res.redirect("/profile"); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            logErr(err, "registering user");
            return res.render("set_profile", layoutMain("ERROR IN SETPROFILE")); // +++ error handlebar
        });
});

// ------------------ Edit Profile --------------------- //

app.get("/editprofile", mw.requireLoggedIn, (req, res) => {
    res.render("edit_profile", layoutMain("Edit Profile"));
});

app.post("/editprofile", mw.requireLoggedIn, (req, res) => {
    editProfile(req)
        .then(({ rows }) => {
            return res.redirect("/profile"); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            logErr(err, "registering user");
            return res.render(
                "edit_profile",
                layoutMain("ERROR IN editPROFILE")
            ); // +++ error handlebar
        });
});
