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

//********************* Test ********************//

app.get("/test", (req, res) => {
    res.render("test", layoutMain("Test Form"));
    // hasUserSigned()
    //     ? res.redirect("/thanks")
    //     : res.render("test", layoutMain("Sign Petition"));
});

app.post("/test", (req, res) => {
    const { first, last, email, password, passconfirm } = req.body;
    if (password !== passconfirm) {
        return res.render("test", layoutMain("PASS DOES NOT MATCH")); // +++ Add handlebar partials/css classes to highlight thr error
    } else {
        hash(password)
            .then((hashedPass) => {
                db.registerUser(first, last, email, hashedPass)
                    .then()
                    .catch((err) => {
                        console.log("error in register user", err);
                        return res.render("test", layoutMain("ERROR REGISTER"));
                    });
            })
            .catch((err) => {
                console.log("error in hashing", err);
            });
    }
});

// ================ Real Routes =============== //

app.get("/", (req, res) => {
    // +++ edit redirect route --- think site structure
    console.log(req.session);
    return res.redirect("/test");
});

app.get("/thanks", (req, res) => {
    // Retrieve session id and display signature
    console.log(req.session);
    hasUserSigned()
        ? res.render("thanks", layoutMain("Thanks for signing!")) // +++ add renderedImage --- to handlebar partials maybe?
        : res.redirect("/");
});

app.get("/signers", (req, res) => {
    res.render("signers", layoutMain("List of Signers"));
});

//---- Register ----//
app.get("/register", (req, res) => {
    res.render("register", layoutMain("Register"));
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then() // faa hashedPassword -- if everything ges to plan, redir to petiition page
        .catch((err) => {
            console.log("!!! Error in register", err);
            // re-render page with an apropriate error message -- you should always give the user some response!
        });
});

//---- Login ----//
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

// ---- Sign ---- +++ turned to test -- EDIT LATER //
app.get("/sign", (req, res) => {
    res.render("sign", layoutMain("Sign now!"));
    // hasUserSigned()
    //     ? res.redirect("/thanks")
    //     : res.render("test", layoutMain("Sign Petition"));
});

app.post("/sign", (req, res) => {
    // Req.body --- the data posted, that has to be validated
    const { first, last, signature } = req.body;
    console.log(first, last, signature);

    db.signPetition(first,last,signature)
    .then()
    .catch((err) => {
      console.log("error in signPetition", err);
    });

    // if (first.length < 2 || last.length < 2) {
    //     console.log("!!!!!!data not valid");
    //     // +++ Add code here to highlight problematic fields
    // } else {
    //     console.log("POST request sent");
    //     // +++ Assign id to session --- then apply to cookie and to the get img thing
    //     req.session.sigId = 6969; //// +++ CONNECT IT TO DB
    //     cOOKIEtHINGIE = true;
    //     console.log(req.session);
    //     return res.redirect("/thanks");
    // }

    // DB Query --- insert data to db AND return signature id
    // db.insertData()
    //     .then(({ rows }) => {
    //         console.log("rows", rows);
    //     })
    //     .catch((err) => {
    //         console.log("err", err);
    //     });

    // Cookie Definition --- res.cookie("session-id", {configObj})

    // Protect against Clickjacking
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    res.setHeader("X-Frame-Options", "DENY");
});

//---- Else ----//
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

//
//
//
//
// ================ Side Functions ================== //

//----------- Fn to check if signed
let cOOKIEtHINGIE;
//>>>> when cls are no longer needed (when it works), refactor into ternary op
// >>> maybe try to keep this fn in another file??
const hasUserSigned = () => {
    cOOKIEtHINGIE = false;
    // check if user has already signed petition --- gives access or not to page
    // check for cookies
    // if theres cookies, change hasSigned = true
    if (cOOKIEtHINGIE === true) {
        console.log("user HAS signed \\o/");
        return true;
    } else {
        console.log("user has not signed yet");
        return false;
    }
};
