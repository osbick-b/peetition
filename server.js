const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

const profileRoutes = require("./routes/profile_routes");
const signersRoutes = require("./routes/signers_routes");
const loginRoutes = require("./routes/login_routes");
const registerRoutes = require("./routes/register_routes");
const signRoutes = require("./routes/sign_routes");
const thanksRoutes = require("./routes/thanks_routes");

// --- things that have to be in the routes files

const db = require("./database/db");
const mw = require("./route_middleware");
const { engine } = require("express-handlebars");
const { compare, hash } = require("./bc");

const { layoutMain, editProfile, logErr } = require("./niftypack");

// // =============== Middleware =================== //

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: "i'm gay",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly: true,
        sameSite: true,
        // secure: true, // --- *** was the cause of the cookie problem
    })
);

app.use(mw.logRouteInfo);
app.use((req, res, next) => {
    if (req.url !== "/favicon.ico") {
        console.log(`${req.method}  ${req.url}\t`, req.session);
        next();
    }
});

// ================ Routes with Router ================== //

app.use("/register", registerRoutes);

app.use("/login", loginRoutes);

app.use("/profile", profileRoutes);

app.use("/thanks", thanksRoutes);

app.use("/signers", signersRoutes);

app.use("/sign", signRoutes);

// ================ Routes without Router ================== //

app.get("/", (req, res) => {
    return res.redirect("/signers"); // --- editing with whatever route we're working on now. !!! check for final version
});

// ------ Logout ----- //
app.get("/logout", mw.requireLoggedIn, (req, res) => {
    req.session = null;
    return res.redirect("/");
});


// ================== Star Route ================== //

app.get("*", (req, res) => {
    if (req.url !== "/favicon.ico") {
        console.log("----in STAR ROUTE");
        return res.redirect("/");
    }
});

// ================= Event Listener ============= //

app.listen(process.env.PORT || 8080, () =>
    console.log(">> listening... http://localhost:8080")
);

//////////////////// THE END ///////////////////

// app.get("/thanks", mw.requireLoggedIn, mw.requireHasSigned, (req, res) => {
//     db.getCanvasSignature(req.session.user_id)
//         .then((results) => {
//             // return res.render("testprofile", layoutMain("Test Profile", signature));
//             return res.render(
//                 "thanks",
//                 layoutMain("Thanks for signing!", results.rows[0])
//             );
//         })
//         .catch((err) => {
//             console.log("error in getCanvasSignature", err);
//         });
// });

// app.get("/profile", mw.requireLoggedIn, (req, res) => {
//     return db
//         .getProfile(req.session.user_id)
//         .then((results) => {
//             res.render(
//                 "user_profile",
//                 layoutMain("My Profile", results.rows[0])
//             );
//         })
//         .catch((err) => {
//             logErr(err, "getting user profile");
//         });
// });

// app.get("/signers", (req, res) => {
//     db.getListSigners()
//         .then(({ rows }) => {
//             res.render("signerslist", layoutMain("List of Signers", rows));
//         })
//         .catch((err) => {
//             logErr(err, "getting signers list");
//         });
// });

// app.get("/signers/:city", (req, res) => {
//     db.getSignersByCity(req.params.city)
//         .then(({ rows }) => {
//             console.log("from DB --- rows by city", rows);
//             res.render(
//                 "signersbycity",
//                 layoutMain(`List of signers in ${rows}`, rows)
//             );
//         })
//         .catch((err) => {
//             logErr(err, "getting signers by city");
//         });
// });

// // ================== GET POST Routes ===================//

// //---- Login ----//

// app.get("/login", mw.requireLoggedOut, (req, res) => {
//     res.render("login", layoutMain("Login"));
// });

// app.post("/login", mw.requireLoggedOut, (req, res) => {
//     const { email, password } = req.body;
//     return db
//         .getCredentials(email)
//         .then((credentials) => {
//             const { user_id, saved_pass } = credentials.rows[0];
//             return compare(password, saved_pass);
//         })
//         .then((isMatch) => {
//             return isMatch && db.getCookieInfo(email);
//         })
//         .then(({ rows }) => {
//             console.log("from DB >> cookie info at login", rows[0]);
//             req.session = rows[0];
//             res.redirect("/profile");
//         })
//         .catch((err) => {
//             logErr(err, "logging in");
//             return res.render("login", layoutMain("ERROR IN Login")); // +++ error handlebar
//         });
// });

// //---- Register ----//

// app.get("/register", mw.requireLoggedOut, (req, res) => {
//     res.render("register", layoutMain("Register"));
// });

// app.post("/register", mw.requireLoggedOut, (req, res) => {
//     const { first, last, email, password, passconfirm } = req.body;
//     return password === "" || password !== passconfirm
//         ? res.render("register", layoutMain("INVALID PASS")) // +++ error handlebar
//         : hash(password)
//               .then((hashedPass) => {
//                   return db.registerUser(first, last, email, hashedPass);
//               })
//               .then((results) => {
//                   req.session = results.rows[0]; // getting from db --> id, first, last
//                   return res.redirect("/sign");
//               })
//               .catch((err) => {
//                   logErr(err, "registering user");
//                   return res.render(
//                       "register",
//                       layoutMain("ERROR IN REGISTER")
//                   ); // +++ error handlebar
//               });
// });

// // ------------------ Set Profile --------------------- //

// app.get("/setprofile", mw.requireLoggedIn, (req, res) => {
//     res.render("set_profile", layoutMain("Set Profile"));
// });

// app.post("/setprofile", mw.requireLoggedIn, (req, res) => {
//     const { city, age, website } = req.body;
//     // +++ VALIDATE URL ---- maybe on DB side?
//     return db
//         .setProfile(city, age, website, req.session.user_id)
//         .then(({ rows }) => {
//             return res.redirect("/profile"); // !!! FINAL --- go to sign
//         })
//         .catch((err) => {
//             logErr(err, "registering user");
//             return res.render("set_profile", layoutMain("ERROR IN SETPROFILE")); // +++ error handlebar
//         });
// });

// // ------------------ Edit Profile --------------------- //

// app.get("/editprofile", mw.requireLoggedIn, (req, res) => {
//     res.render("edit_profile", layoutMain("Edit Profile"));
// });

// app.post("/editprofile", mw.requireLoggedIn, (req, res) => {
//     editProfile(req)
//         .then(({ rows }) => {
//             return res.redirect("/profile"); // !!! FINAL --- go to sign
//         })
//         .catch((err) => {
//             logErr(err, "registering user");
//             return res.render(
//                 "edit_profile",
//                 layoutMain("ERROR IN editPROFILE")
//             ); // +++ error handlebar
//         });
// });

// // ---- Sign ---- //

// app.get("/sign", mw.requireLoggedIn, mw.requireNotSigned, (req, res) => {
//     res.render("sign", layoutMain("Sign now!"));
// });

// app.post("/sign", mw.requireLoggedIn, mw.requireNotSigned, (req, res) => {
//     const { signature } = req.body;

//     // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
//     // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
//     // res.setHeader("X-Frame-Options", "DENY");

//     return db
//         .signPetition(signature, req.session.user_id) // +++ gotta check for if user has really signed canvas. prob not here
//         .then((results) => {
//             // return res.redirect("/thanks"); // ??? is redirecting even if error
//             return res.redirect("/thanks"); // *** just for testing of displ sign
//         })
//         .catch((err) => {
//             logErr(err, "registering user");
//         });
// });

// // if it's deployed live on heroku, we need to listen to heroku's port instead of 8080
// // heroku will create this prop PORT in our process environment
