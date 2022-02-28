const db = require("./database/db");
const { compare, hash } = require("./bc");
const req = require("express/lib/request");
const res = require("express/lib/response");

// ======= Functions ======= //

// -------- layoutMain ------- //

module.exports.layoutMain = (title, data = null) => {
    const hdlbConfig = {
        dataToRender: data,
        title: `${title} - MyPetition`,
        layout: "main",
    };
    return hdlbConfig;
};

// -------- LogErr ------- //

// ??? how to acces fn from inside the file?
module.exports.logErr = (err, where) => {
    console.log(`>>> ERROR in: ${where}`, err);
};

// // -------- checkCredentials ------- //

// module.exports.checkCredentials = (credentials) => {
//     console.log("checking credentials");
//     const { user_id, saved_pass } = credentials.rows[0];
//     return compare(password, saved_pass);
// };

// // -------- SetCookie ------- //

// module.exports.setUserCookie = (email) => {

// };

// -------- Edit Profile -------- // +++ NOT DONE
module.exports.editProfile = (req) => {
    // all logic will be done here
    const userInput = req.body; // +++ VALIDATE URL
    const user_id = req.session.user_id;
    let responseObj = {};

    if (
        userInput.website &&
        !userInput.website.startsWith("http://" || "https://")
    ) {
        throw new Error("website input not valid");
    }

    return db
        .updateRegister(userInput, user_id)
        .then((results) => {
            responseObj = results.rows[0];
            return db.updateProfile(userInput, user_id);
        })
        .then((results) => {
            responseObj = { ...responseObj, ...results.rows[0] };
            console.log("responseobj after merging", responseObj);

            if (userInput.password !== "") {
                console.log("gonna update pass");
                return hash(req.body.password);
            }
        })
        .then((hashedPass) => {
            if (hashedPass) {
                // console.log("pass has been hashed");
                return db.updatePassword(hashedPass, user_id);
            }
        })
        .catch((err) => {
            console.log(`>>> ERROR in: nif -- editProfile`, err);
        });
};
