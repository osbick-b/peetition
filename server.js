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

app.get("/", (req, res) => {
    console.log(">> req.session /post", req.session);
    return res.redirect("/register"); // --- editing with whatever route we're working on now. !!! check for final version
});

app.get("/thanks", (req, res) => {db.getCanvasSignature(req.session.id)
    .then((signature) => {
        // return res.render("testprofile", layoutMain("Test Profile", signature));
        return res.render("thanks", layoutMain("Thanks for signing!", signature));
    })
    .catch((err) => {
        console.log("error in getCanvasSignature", err);
    });
});

app.get("/signers", (req, res) => {
    db.getListSigners()
        .then((signers) => {
            res.render("signerslist", layoutMain("List of Signers", signers));
        })
        .catch((err) => {
            console.log("error in getListSigners", err);
        });
});

app.get("/profile", (req, res) => {
    console.log(">> req.session /profile", req.session);
    db.getUserProfile(req.session.id)
        .then((results) => {
            console.log(">> results in getUserProfile.then", results);
            res.render("userprofile", layoutMain("My Profile", results));
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
            return res.render("testprofile", layoutMain("Test Profile", signature));
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
                  db.registerUser(first, last, email, hashedPass)
                      .then((results) => {
                          //   const { id, first, last } = results;
                          // ---- COOKIE THING --- trying to set cookie session, for some reason it wont pass on
                          req.session = results;
                          console.log(
                              ">>> req.session AFTER >>> = results",
                              req.session
                          );
                          return res.redirect("/sign");
                      })
                      .catch((err) => {
                          console.log("error in register user", err);
                          return res.render(
                              "register",
                              layoutMain("ERROR IN REGISTER")
                          ); // +++ error handlebar
                      });
              })
              .catch((err) => {
                  console.log("error in hashing", err);
              });
});

//---- Login ----// +++ NOT DONE YET

app.get("/login", (req, res) => {
    res.render("login", layoutMain("Login"));
});

app.post("/login", (req, res) => {
    const fakeHash = "aosjdoaijieIOEFJI(8327h"; // for test purposes only xxx
    compare("mySecretPass", fakeHash)
        .then((isMatch) => {
            console.log("Does password match db? ", isMatch);
        })
        .catch((err) => {
            console.log("!!! Error in compare passwords", err);
        });
});

// ---- Sign ---- //

app.get("/sign", (req, res) => {
    console.log("req.session.id /sign", req.session.id);
    res.render("sign", layoutMain("Sign now!"));
});

app.post("/sign", (req, res) => {
    // console.log(">>> req.session /sign >>>", req.session);
    // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
    // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // res.setHeader("X-Frame-Options", "DENY");

    const { signature } = req.body;
    console.log("req.session.id /sign", req.session.id);
    db.signPetition(signature, req.session.id) // +++ gotta check for if user has really signed canvas. prob not here
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
