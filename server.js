const express = require("express");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");
const { compare, hash } = require("./bc");
const { layoutMain } = require("./niftypack");

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

// ================ Routes ================== //

// +++ define permissions according to user session/if signed

app.get("/", (req, res) => {
    console.log(">> req.session /post", req.session);
    return res.redirect("/login"); // --- editing with whatever route we're working on now. !!! check for final version
});

app.get("/logout", (req, res) => {
    console.log("req.session /clear BEFORE", req.session);
    req.session = null;
    console.log("req.session /clear AFTER", req.session);
    return res.redirect("/");
});

app.get("/thanks", (req, res) => {
    db.getCanvasSignature(req.session.id)
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

app.get("/signers", (req, res) => {
    db.getListSigners()
        .then((results) => {
            res.render(
                "signerslist",
                layoutMain("List of Signers", results.rows)
            );
        })
        .catch((err) => {
            console.log("error in getListSigners", err);
        });
});

app.get("/profile", (req, res) => {
    console.log(">> req.session /profile", req.session);
    return db
        .getUserProfile(req.session.id)
        .then((results) => {
            console.log(">> results in getUserProfile.then", results.rows[0]);
            res.render(
                "userprofile",
                layoutMain("My Profile", results.rows[0])
            );
        })
        .catch((err) => {
            console.log("error in getUserProfile", err);
        });
});

//*********************TEST ROUTE*****************//
app.get("/test", (req, res) => {
    console.log(">> req.session /test", req.session);
    db.getCanvasSignature(req.session.id)
        .then((signature) => {
            return res.render(
                "testprofile",
                layoutMain("Test Profile", signature)
            );
        })
        .catch((err) => {
            console.log("error in getCanvasSignature", err);
        });
});

//================== GET POST Routes ===================//

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
                  console.log(">>> INIT req.session", req.session);
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

//---- Login ----// +++ NOT DONE YET

app.get("/login", (req, res) => {
    res.render("login", layoutMain("Login"));
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("input /login", email, password);
    // return db
    //     .getCredentials(email)
    //     .then((credentials) => {
    //         const { user_id, saved_pass } = credentials.rows[0];
    //         console.log(
    //             ">> getting from DB -- user credentials ",
    //             credentials.rows[0]
    //         );
    //         return compare(password, saved_pass);
    //     })
    return db
        .getCredentials(email)
        .then((results) => {
            const { saved_pass } = results.rows[0];
            return compare(password, saved_pass);
        })
        .then((isMatch) => {
            console.log("EMAIL from outer scope", email);
            console.log("Does password match db? ", isMatch);
            req.session = isMatch.rows[0];
            console.log(">> req.session /login AFTER", req.session);
            return res.redirect("/profile");
        })
        .catch((err) => {
            console.log("!!! Error in compare passwords", err);
            return res.render("login", layoutMain("ERROR IN Login")); // +++ error handlebar
        });
});

// ---- Sign ---- //

app.get("/sign", (req, res) => {
    console.log("req.session.id /sign", req.session.id);
    res.render("sign", layoutMain("Sign now!"));
});

app.post("/sign", (req, res) => {
    console.log("req.session.id /sign", req.session.id);
    const { signature } = req.body;

    // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
    // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // res.setHeader("X-Frame-Options", "DENY");

    return db
        .signPetition(signature, req.session.id) // +++ gotta check for if user has really signed canvas. prob not here
        .then((results) => {
            // req.session.hasSigned = true;
            // return res.redirect("/thanks"); // ??? is redirecting even if error
            return res.redirect("/profile"); // *** just for testing of displ sign
        })
        .catch((err) => {
            console.log("error in signPetition", err);
        });
});

//================== Other Routes ==================//

/////// add a logout route to clear cookies
app.get("/clear", (req, res) => {
    console.log("req.session /clear BEFORE", req.session);
    req.session = null;
    console.log("req.session /clear AFTER", req.session);
    res.redirect("/");
});

app.get("*", (req, res) => {
    if (req.url !== "/favicon.ico") {
        console.log("----in STAR ROUTE");
        return res.redirect("/");
    }
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
