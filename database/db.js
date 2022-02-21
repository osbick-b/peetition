const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); // localhost:5432/dbname ---- port that postgres uses by default

//====================================================================//

// --- Register --- //
module.exports.registerUser = (first, last, email, password) => {
    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [first, last, email, password]
    )
        .then((results) => {
            console.log("results in db", results.rows);
            
        })
        .catch((err) => {
            console.log("error in db.query", err);
        });
};


// --- Sign Petition --- //
module.exports.signPetition = (first, last, signature) => {
    return db
        .query(
            "INSERT INTO signatures (first,last,signature) VALUES ($1, $2, $3) RETURNING *",
            [first, last, signature]
        )
        .then((results) => {
            console.log("signature from db", results);
        })
        .catch((err) => {
            console.log("error in db.query 5", err);
        });
};


// --- Get User Data --- //
module.exports.getUserData = () => {
  
};





// /// ====== 1
// db.query() // fn that makes a request to this database named above
//     .then((results) => {
//        console.log("results.rows: ", results.rows);
//     })
//     .catch((err) => {
//         console.log("err", err);
//     });

///// ====== 2
// db.query("SELECT * FROM cities") // fn that makes a request to this database named above -- you can do sth like - db.query('SELECT * FROM cities');
//     .then(({ rows }) => { // the results are an obj full of stuff and metadata and sub-objs, like the spotify one. here we are destructuring it to get the data we want -- the rows
//         console.log("results: ", results);
//     })
//     .catch((err) => {
//         console.log("err", err);
//     });

///// ====== 3
//     module.exports.getAllCities = () => {
//         // it will return the promise of db.query
//         // wr're gonna do the then & catch not here, but on the route (-- the other file)
//         return db.query("SELECT * FROM cities");
//     };

//     module.exports.addCity = (city, population, country) => {
//         const sqlQuery = `
//         INSERT INTO cities (city, population, country)
//         VALUES ($1, $2, $3)`;
//         return db.query(sqlQuery, [city, population, country]);
//  };
// you should NEVER do it like this ---> VALUES (${city}, ${population}, ${country})
// bc it makes you vulnerable to ppl passing commands and stuff to your db, bc data is not being checked
// so you make it by using these $1 selectors that refer to values in the 2nd arg, that will get sanitized b4 being applied
// the number of times you use the param on arg2 should obv match the $s
//
// by default a INSERT query doesnt return anything, but you can add sth like for ex:: RETURNING city, country

// // dataObj here being the obj submitted by the form, with props first, last, signature
// insertData = function (dataObj) {
//     for (key in dataObj) {
//         // +++++
//     }
// };

// //======>>>>> FINAL: organize all fns into an obj
// module.exports = {};
