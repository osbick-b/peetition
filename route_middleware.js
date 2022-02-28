//////////// ROUTE MIDDLEWARE //////////////

// const { Test } = require("supertest");

    module.exports.logRouteInfo = (req, res, next) => {
    if (req.url !== "/favicon.ico") {
        console.log(`${req.method}  ${req.url}\t`, req.session);
        next();
    }
};

module.exports.requireLoggedIn = (req, res, next) => {
    req.session.user_id ? next() : res.redirect("/login");
};

module.exports.requireLoggedOut = (req, res, next) => {
    !req.session.user_id ? next() : res.redirect("/profile");
};

module.exports.requireHasSigned = (req, res, next) => {
    req.session.has_signed ? next() : res.redirect("/sign");
};

module.exports.requireNotSigned = (req, res, next) => {
    !req.session.has_signed ? next() : res.redirect("/thanks");
};
