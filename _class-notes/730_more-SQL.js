const { use } = require("express/lib/application");
const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/dogs"); // localhost:5432/dbname ---- port that postgres uses by default




