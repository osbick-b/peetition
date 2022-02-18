const express = require("express");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");

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
    console.log(`${req.method}\t${req.url}`);
    next();
});

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

// ================ Routes ================== //

// app.get("/", (req, res) => {
//     console.log("a GET request was made to the / route");
//     db.getAllCities() // here we get the promise of this value -- the data from the db
//         .then(({ rows }) => {
//             console.log("rows: ", rows);
//             res.json(rows); // now you send back json to the browser, instead of just seeing it here
//         })
//         .catch((err) => {
//             console.log("err", err);
//         });
// });

app.get("/", (req, res) => {
    // console.log(req.session);
    return res.redirect("/sign");
});

app.get("/thanks", (req, res) => {
    // Retrieve session id and display signature
    console.log(req.session);

    hasUserSigned()
        ? res.render("thanks", {
              title: "Thank you for signing!",
              layout: "main",
              signatureImg: "", /// add signature img reference
          })
        : res.redirect("/");
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        title: "Signatures - Petition",
        layout: "main",
    });
});

app.get("/sign", (req, res) => {
    hasUserSigned()
        ? res.redirect("/thanks")
        : res.render("form", {
              title: "Sign Petition",
              layout: "main",
          });
});

app.post("/sign", (req, res) => {
    // Req.body --- the data posted, that has to be validated
    const { first, last, signature } = req.body;
    console.log(first, last);
    if (first.length < 2 || last.length < 2) {
        console.log("!!!!!!data not valid");
        // +++++++ Add code here to highlight problematic fields
    } else {
        console.log("POST request sent");
        // ++++++++ Assign id to session --- then apply to cookie and to the get img thing 
        req.session.sigId = 6969; //// +++++++ CONNECT IT TO DB
        cOOKIEtHINGIE = true;
        console.log(req.session);
        return res.redirect("/thanks");
    }

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
