const express = require("express");
const app = express();
const db = require("./database/db");

const { engine } = require("express-handlebars");

// =============== Middleware =================== //

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

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

app.get("/", (req,res) => {
  res.render('home', {
    title: "Petition - Home",
    layout: "main",
  });  
});


app.get("/sign", (req,res) => {
  res.render('form', {
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

app.get("*", (req,res) => {
  return res.redirect("/");
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
