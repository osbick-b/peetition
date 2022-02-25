const db = require("./database/db");
const { compare, hash } = require("./bc");
const req = require("express/lib/request");

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
    console.log("in nif -- userInput editProfile (req.body) ", userInput);
    let responseObj = {};

    return db
        .updateRegister(userInput, user_id)
        .then((results) => {
            const testObj = {test1: 2, test3:4};
            responseObj = results.rows[0];
            console.log("responseObj after updateRegister", responseObj);
            return db.updateProfile(userInput, user_id)
            // !!!!!!!!! THE PROBLEM IS HERE
        }).then((results) => {
            console.log("results.rows[0] on updateProfile", results.rows[0]);
            responseObj = { ...responseObj, ...results.rows[0]};
            console.log("responseobj after merging", responseObj);
            return responseObj; // !!! at the very end only
        })
        .catch((err) => {
            console.log(`>>> ERROR in: nif -- editProfile`, err);
        });
};
