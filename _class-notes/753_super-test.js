/////// SUPER TEST ////////
const supertest = require("supertest");
const app = require("server.js"); // is the file you are using for routing, whatever its name is 

// the obj it returns is a promise+, with some extra stuff we dont often use
// you compare the thing you get to the thing you suppose you should be getting

// it was written b4 JEST