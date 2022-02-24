/////// SUPER TEST ////////
const supertest = require("supertest");
const app = require("server.js"); // is the file you are using for routing, whatever its name is 

// the obj it returns is a promise+, with some extra stuff we dont often use
// you compare the thing you get to the thing you suppose you should be getting

// it was written b4 JEST

////// MOCKS
// you keep your __mocks__ folder close to the node_modules folder
// JEST will look in it for anything that matches the node modules, and use it instead

// for example for the cookieSession, you can set mock cookies

// return ---> means jest (or anything really) has to wait for this promise to be resolved.




