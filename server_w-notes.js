const express = require("express");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");
const { compare, hash } = require("./bc");
const { layoutMain, hasUserSigned, editProfile } = require("./niftypack");

// =============== Middleware =================== //

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: "i'm gay",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly: true, // --- *** was the cause of the cookie problem -- after all, this aint no http request :P
        sameSite: true,
        // secure: true, // --- *** issues with this one too
    })
);

app.use((req, res, next) => {
    if (req.url !== "/favicon.ico") {
        console.log(`${req.method}\t${req.url}`);
        next();
    }
});

// ================ GET ONLY Routes ================== //

// +++ define permissions according to user session/if signed

// app.get("", (req,res) => {
// console.log(">> req.session /post", req.session);

// });

app.get("/", (req, res) => {
    console.log(">> req.session /post", req.session);
    return res.redirect("/signers"); // --- editing with whatever route we're working on now. !!! check for final version
});

app.get("/thanks", (req, res) => {
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

app.get("/profile", (req, res) => {
    return db
        .getProfile(req.session.user_id)
        .then((results) => {
            res.render(
                "user_profile",
                layoutMain("My Profile", results.rows[0])
            );
        })
        .catch((err) => {
            console.log("error in getProfile", err);
        });
});

app.get("/signers", (req, res) => {
    db.getListSigners()
        .then(({ rows }) => {
            res.render("signerslist", layoutMain("List of Signers", rows));
        })
        .catch((err) => {
            console.log("error in getListSigners", err);
        });
});

app.get("/signers/:city", (req, res) => {
    db.getSignersByCity(req.params.city)
        .then(({ rows }) => {
            console.log("from DB --- rows by city", rows);
            res.render(
                "signersbycity",
                layoutMain(`List of signers in ${rows}`, rows)
            );
        })
        .catch((err) => {
            console.log("error in getSignersByCity", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/");
});

//================== GET POST Routes ===================//

//---- Login ----//

app.get("/login", (req, res) => {
    res.render("login", layoutMain("Login"));
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    return db
        .getCredentials(email)
        .then((credentials) => {
            const { user_id, saved_pass } = credentials.rows[0];
            return compare(password, saved_pass);
        })
        .then((isMatch) => {
            return isMatch && db.getUserCookieInfo(email);
        })
        .then(({ rows }) => {
            req.session = rows[0];
            res.redirect("/profile");
        })
        .catch((err) => {
            console.log("!!! Error in compare passwords", err);
            return res.render("login", layoutMain("ERROR IN Login")); // +++ error handlebar
        });
});

//---- Register ----//

app.get("/register", (req, res) => {
    res.render("register", layoutMain("Register"));
});

app.post("/register", (req, res) => {
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
                  console.log("error in register user", err);
                  return res.render(
                      "register",
                      layoutMain("ERROR IN REGISTER")
                  ); // +++ error handlebar
              });
});

// ------------------ Set Profile --------------------- //

app.get("/setprofile", (req, res) => {
    res.render("set_profile", layoutMain("Set Profile"));
});

app.post("/setprofile", (req, res) => {
    const { city, age, website } = req.body;
    // +++ VALIDATE URL ---- maybe on DB side?
    return db
        .setProfile(city, age, website, req.session.user_id)
        .then(({ rows }) => {
            return res.redirect("/profile"); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            console.log("error in setprofile", err);
            return res.render("set_profile", layoutMain("ERROR IN SETPROFILE")); // +++ error handlebar
        });
});

// ------------------ Edit Profile --------------------- //

app.get("/editprofile", (req, res) => {
    res.render("edit_profile", layoutMain("Edit Profile"));
});

app.post("/editprofile", (req, res) => {
    editProfile(req)
        .then(({ rows }) => {
            return res.redirect("/profile"); // !!! FINAL --- go to sign
        })
        .catch((err) => {
            console.log("error in editprofile", err);
            return res.render(
                "edit_profile",
                layoutMain("ERROR IN editPROFILE")
            ); // +++ error handlebar
        });
});

// ---- Sign ---- //

app.get("/sign", (req, res) => {
    hasUserSigned(req)
        ? res.redirect("/thanks")
        : res.render("sign", layoutMain("Sign now!"));
});

app.post("/sign", (req, res) => {
    const { signature } = req.body;

    // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
    // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // res.setHeader("X-Frame-Options", "DENY");

    return db
        .signPetition(signature, req.session.user_id) // +++ gotta check for if user has really signed canvas. prob not here
        .then((results) => {
            req.session.hasSigned = true;
            // return res.redirect("/thanks"); // ??? is redirecting even if error
            return res.redirect("/thanks"); // *** just for testing of displ sign
        })
        .catch((err) => {
            console.log("error in signPetition", err);
        });
});

//================== Other Routes ==================//

app.get("*", (req, res) => {
    if (req.url !== "/favicon.ico") {
        console.log("----in STAR ROUTE");
        return res.redirect("/");
    }
});

app.listen(process.env.PORT || 8080, () =>
    console.log(">> listening... http://localhost:8080")
);

// if it's deployed live on heroku, we need to listen to heroku's port instead of 8080
// heroku will create this prop PORT in our process environment
