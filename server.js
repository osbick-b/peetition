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
app.use(express.urlencoded({ extended: false })); ////---- setup properly

app.use(
    cookieSession({
        secret: "i'm gay",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly: true,
        sameSite: true,
        secure: true,
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
    console.log(req.session);
    return res.redirect("/profile");
});

app.get("/thanks", (req, res) => {
    console.log("req.session - in /thanks", req.session);
    res.render("thanks", layoutMain("Thanks for signing!"));
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
    console.log("req.session - in /profile", req.session);
    db.getUserProfile(6) // +++ edit to userId once you get it running
        .then((results) => {
            // console.log(">> results in getUserProfile.then", results);
            res.render("userprofile", layoutMain("My Profile", results));
        })
        .catch((err) => {
            console.log("error in getUserProfile", err);
        });
});

//================== GET POST Routes ===================//

//---- Register ----//

app.get("/register", (req, res) => {
    // // ---- attempting to hardcode a val here to see if it passes on --> it does not. WHYYYY???
    // console.log("req.session -- /register", req.session);
    // req.session.someProp = "HOPE IT WORKS";
    // console.log("req.session -- /register AFTER", req.session);
    res.render("register", layoutMain("Register"));
});

app.post("/register", (req, res) => {
    const { first, last, email, password, passconfirm } = req.body;
    return password !== passconfirm
        ? res.render("register", layoutMain("PASS DOES NOT MATCH")) // +++ error handlebar
        : hash(password)
              .then((hashedPass) => {
                  db.registerUser(first, last, email, hashedPass)
                      .then((results) => {
                          const { id, first, last } = results;
                          // ---- trying to define cookie session, for some reason it wont pass on
                          console.log("results", results);
                          req.session = results;
                          console.log("req.session AFTER", req.session);
                          res.redirect("/sign");
                      })
                      .catch((err) => {
                          // ??? when do you need to use return and when not??
                          console.log("error in register user", err);
                          res.render(
                              "register",
                              layoutMain("ERROR IN REGISTER")
                          ); // +++ error handlebar
                      });
              })
              .catch((err) => {
                  console.log("error in hashing", err);
              });
});

//---- Login ----//

app.get("/login", (req, res) => {
    console.log("req.session /login", req.session);
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
    console.log("req.session /sign", req.session);
    res.render("sign", layoutMain("Sign now!"));
});

app.post("/sign", (req, res) => {
    // // Protect against Clickjacking --- ??? where does it go? -- for sure b4 sending stuff to client, but on what route(s)?
    // res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // res.setHeader("X-Frame-Options", "DENY");

    const { signature } = req.body;
    db.signPetition(signature, req.session.id) // +++ gotta check for if user has really signed canvas. prob not here
        .then((results) => {
            req.session.hasSigned = true;
            return res.redirect("/thanks"); // ??? is redirecting even if error
        })
        .catch((err) => {
            console.log("error in signPetition", err);
        });
});

//================== Other Routes ==================//

/////// add a logout route to clear cookies
app.get("/clear", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.get("*", (req, res) => {
    if (req.url !== "/favicon.ico") {
        console.log("----in STAR ROUTE");
        return res.redirect("/");
    }
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
