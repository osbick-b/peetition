const express = require("express");
const app = express();

app.use(express.static('./public'));

app.get("/", (req,res) => {
    console.log("a GET request was made to the / route");
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
