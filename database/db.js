const { use } = require("express/lib/application");
const spicedPg = require("spiced-pg");

const db = spicedPg(process.env.DATABASE_URL || `postgres:postgres:postgres@localhost:5432/petition`); // localhost:5432/dbname ---- port that postgres uses by default

/////// FOR HEROKU -- we're gonna have another version (empty) of our tables and stuff deployed on heroku
// 

//====================================================================//

// ------------ Register ------------- //
module.exports.registerUser = (first, last, email, password) => {
    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id AS user_id, first, last",
        [first, last, email, password]
    );
};

// ------------ Login ------------- //

module.exports.getCredentials = (email) => {
    return db.query(
        "SELECT password AS saved_pass FROM users WHERE email = $1 ",
        [email]
    );
};

module.exports.getUserCookieInfo = (email) => {
    return db.query(
        "SELECT id AS user_id, first, last FROM users WHERE email = $1 ",
        [email]
    );
};

// ------------- Sign Petition ------------- //
module.exports.signPetition = (signature, user_id) => {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING signature, user_id",
        [signature, user_id]
    );
};

// -------------- Get User Data -------------- //
module.exports.getUserProfile = (user_id) => {
    return db.query("SELECT first, last, email FROM users WHERE id = $1", [
        user_id,
    ]);
};

// ------------ Get List of Signers ------------- //
module.exports.getListSigners = () => {
    return db.query("SELECT first,last FROM users"); // +++ WHERE hasSigned is true ---- sera q precisa?
};

// ------------ Retrieve signature canvas ------------- //
module.exports.getCanvasSignature = (user_id) => {
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [user_id]);
};

// // ------------ fnName ------------- //
// module.exports.fnName = (user_id) => {
//   db.query()
//       .then()
//       .catch((err) => {
//           console.log("error in db.query XXX", err);
//       });
// };
