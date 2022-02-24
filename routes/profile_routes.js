
const express = require("express");
const router = express.Router();

// ======= Middleware ======= //

router.use((req,res,next) => {
  console.log(`${req.method}: ${req.url} in the profile module`);
})




// ====== Routes ====== //
router.get("/", (req,res) => {
  
});