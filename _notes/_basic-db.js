const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/places"); // localhost:5432/dbname ---- port that postgres uses by default

db.query() // fn that makes a request to this database named above -- you can do sth like - db.query(SELECT * FROM cities);
    .then((results) => {
      console.log('results: ', results);
    })
    .catch((err) => {
      console.log('err', err);
    });




