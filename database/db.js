const { use } = require("express/lib/application");
const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); // localhost:5432/dbname ---- port that postgres uses by default

//====================================================================//

// ------------ Register ------------- //
module.exports.registerUser = (first, last, email, password) => {
    return db
        .query(
            "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first,last",
            [first, last, email, password]
        )
        .then((results) => {
            console.log("row user id from db", results.rows[0]);
            return results.rows[0];
        })
        .catch((err) => {
            console.log("error in db.query", err);
        });
};

// ------------- Sign Petition ------------- //
module.exports.signPetition = (signature, userId) => {
    return db
        .query(
            "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING signature",
            [signature, userId] // +++ add user id
        )
        .then((results) => {
            console.log("row signature from db", results.rows[0]);
            // console.log("signature from db", results.rows);
        })
        .catch((err) => {
            console.log("error in db.query 5", err);
        });
};

// -------------- Get User Data -------------- //
module.exports.getUserProfile = (userId) => {
    return db
        .query(
            "SELECT first, last, email FROM users WHERE id = $1", [userId]
        )
        .then((results) => {
          console.log(">> results in DB getUserProfile",results.rows[0]);
          return results.rows[0];
        //   const { first, last, email } = user;
            // +++ render in handlebars
        })
        .catch((err) => {
            console.log("error in db.query 6", err);
        });
};

// ------------ Get List of Signers ------------- //
module.exports.getListSigners = () => {
  return db
      .query("SELECT first,last FROM users") // +++ WHERE hasSigned is true ---- sera q precisa?
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
          console.log("error in db.query 7", err);
      });
}
