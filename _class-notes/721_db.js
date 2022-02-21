const express = require("express");
const app = express();
const { compare,hash } = require('./__720_bcrypt');

hash("my100cretPassW0rd").then((hashedPassword) => {
  console.log("hashedPassword", hashedPassword);
})