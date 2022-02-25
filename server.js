const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

const profileRoutes = require("./routes/profile_routes");
const signersRoutes = require("./routes/signers_routes");
const loginRoutes = require("./routes/login_routes");
const registerRoutes = require("./routes/register_routes");
const signRoutes = require("./routes/sign_routes");
const thanksRoutes = require("./routes/thanks_routes");

// --- things that have to be in the routes files

const db = require("./database/db");
const mw = require("./route_middleware");
const { engine } = require("express-handlebars");
const { compare, hash } = require("./bc");

const { layoutMain, editProfile, logErr } = require("./niftypack");

// // =============== Middleware =================== //

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: "i'm gay",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly: true,
        sameSite: true,
        // secure: true, // --- *** was the cause of the cookie problem
    })
);

app.use(mw.logRouteInfo);


// ================ Routes with Router ================== //

app.use("/register", registerRoutes);

app.use("/login", loginRoutes);

app.use("/profile", profileRoutes);

app.use("/thanks", thanksRoutes);

app.use("/signers", signersRoutes);

app.use("/sign", signRoutes);

// ================ Routes without Router ================== //

app.get("/", (req, res) => {
    return res.redirect("/login"); // --- editing with whatever route we're working on now. !!! check for final version
});

// ------ Logout ----- //
app.get("/logout", mw.requireLoggedIn, (req, res) => {
    req.session = null;
    return res.redirect("/");
});


// ================== Star Route ================== //

app.get("*", (req, res) => {
    if (req.url !== "/favicon.ico") {
        console.log("----in STAR ROUTE");
        return res.redirect("/");
    }
});

// ================= Event Listener ============= //

app.listen(process.env.PORT || 8080, () =>
    console.log(">> listening... http://localhost:8080")
);

//////////////////// THE END ///////////////////
