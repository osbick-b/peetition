const db = require("./database/db");
const { compare, hash } = require("./bc");
const req = require("express/lib/request");

// ======= Functions ======= //
module.exports.layoutMain = (title, data = null) => {
    const hdlbConfig = {
        dataToRender: data,
        title: `${title} - MyPetition`,
        layout: "main",
    };
    return hdlbConfig;
};

// -------- Edit Profile -------- // +++ NOT DONE
module.exports.editProfile = (req) => {
    const userInput = req.body; // +++ VALIDATE URL
    const user_id = req.session.user_id;
    console.log("in nif -- userInput editProfile (req.body) ", userInput);
    let responseObj = {};

    return db
        .updateRegister(userInput, user_id)
        .then((results) => {
            responseObj = results.rows[0];
            console.log(
                "responseObj after updateRegister",
                responseObj
            );
            return responseObj;
        })
        .catch((err) => {
            console.log(`>>> ERROR in: nif -- editProfile`, err);
        });
};

// ??? how to acces fn from inside the file?
module.exports.logErr = (err, where) => {
    console.log(`>>> ERROR in: ${where}`, err);
};
