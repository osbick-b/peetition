const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

//============ Middleware ==============//
app.use(express.static('./public'));

app.use(cookieSession({}));

app.use((req, res, next) => { //logs reqs
    console.log(`${req.method}\t${req.url}`);
    next();
});

//========== Routes =============//

app.get("/", (req,res) => {
    console.log("a GET request was made to the / route");
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
