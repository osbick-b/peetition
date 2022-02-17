const express = require("express");
const app = express();
const db = require("./database/db");


app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("a GET request was made to the / route");
    db.getAllCities() // here we get the promise of this value -- the data from the db
        .then(({ rows }) => {
            console.log("rows: ", rows);
            res.json(rows); // now you send back json to the browser, instead of just seeing it here
        })
        .catch((err) => {
            console.log("err", err);
        });
});


app.post("/add-new-city", (req,res) => {
  db.addCity('Glasgow', 7000000, 'Scotland')
  .then(({ rows }) => {
    console.log('rows', rows);
  })
  .catch((err) => {
    console.log("err", err);
  })
})

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
