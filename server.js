const express = require("express");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");

// =============== Middleware =================== //

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

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

//----------- Fn to check if signed
//>>>> when cls are no longer needed (when it works), refactor into ternary op
const hasUserSigned = () => {
  cOOKIEtHINGIE = true;
  // check if user has already signed petition --- gives access or not to page
  // check for cookies
  // if theres cookies, change hasSigned = true
  if ((cOOKIEtHINGIE) === true) {
      console.log("user HAS signed \\o/");
      return true;
  } else {
      console.log("user has not signed yet");
      return false;
  }
};
//---------------------

app.get("/", (req,res) => {
  return res.redirect("/sign");
  // return res.redirect(req.url);
});

app.get("/thanks", (req, res) => {
  hasUserSigned()? 
    res.render("thanks", {
        title: "Thank you for signing!",
        layout: "main",
    }) : res.redirect("/");
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        title: "Signatures - Petition",
        layout: "main",
    });
});

app.get("/sign", (req,res) => {
    //----test for cookie session
    req.session.sigId = 6969;
    // console.log("req.session in /SIGN route: ", req.session);


    res.render("form", {
        title: "Sign Petition",
        layout: "main",
    });
});


app.post("/sign", (req,res) => {
  db.addCity('Glasgow', 7000000, 'Scotland')
  .then(({ rows }) => {
    console.log('rows', rows);
  })
  .catch((err) => {
    console.log("err", err);
  })
});

//// add a logout route to clear cookies
app.get("/clear", (req,res) => {
  req.session = null;
  res.redirect("/");
});

app.get("*", (req,res) => {
  console.log("----in STAR ROUTE");
  return res.redirect("/");
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
