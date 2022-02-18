const express = require("express");
const app = express();
//---- Cookies:
const cookieSession = require("cookie-session");

//============ Middleware ==============//
app.use(express.static('./public'));

// ---- Cookies:
app.use(
    cookieSession({
        secret: "i'm gay",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly:true,
        sameSite: true,
        secure: true,
    })
    // it'll create a cookie with a hash, like a 2nd cookie, (session.sig), adding a new layer of security,
    // and it'll always compare your cookie (sessoin), so if you try to temper with it, cookie-session wil say "NONONO", and wipe your cookie out completely
    // its not about encryprion, cookie does get encoded, but it's easily decodable and encodable again
);

//========== Routes =============//

app.get("/", (req,res) => {
    console.log("a GET request was made to the / route");
});

//--------- Test route for assigning sessionId --- see Part2 notes
app.get("/test", (req, res) => {
    console.log("********** IN /test route ********** ");
    req.session.sigId = 1;
    console.log("req.session in /test after adding info: ", req.session);
    console.log("***************************");
    res.sendStatus(200);
});

//-------- add a logout route so you can use it to wipe your cookies, instead of having to go to the dev tools and delete your cookies manually
app.get("/logout", (req,res) => {
  req.session = null;
  res.redirect("/");
});

app.listen(8080, () => console.log(">> listening... http://localhost:8080"));
