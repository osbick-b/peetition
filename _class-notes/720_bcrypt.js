// Roles --- we wont be using it here, but it's a thing ppl use a lot
// like, role of Admin can access certain things that role of user cant usw

// ============ Hashing the password ==========//
const bcrypt = require("bcryptjs");

module.exports.hash = (password) => {
    return bcrypt.genSalt().then(salt => {
        // here is the point where i'll definitely have my salt
        return bcrypt.hash(password, salt);
    });
};

module.exports.compare = bcrypt.compare;


//========== Routes ========//

app.post("/register", (req,res) => {
  const { first,last,email,password } = req.body;
  hash(password)
    .then((hashedPassword) => {
      console.log("hashedPassword", hashedPassword);
        // Store the users input data - names, emails - in the database
        // if everything ges to plan, redir to petiition page
        // otherwise re-render same page with error msg
    })
    .catch((err) => {
      console.log("error in hashing password", err);
      // re-render page with an apropriate error message -- you should always give the user some response!
    });
})

app.get("/login", (req,res) => {
  res.render("login");
});
// still gonna be a post req to the db
// button in a form will automatically submit the data to whatever db it took it from in the 1st place

app.post("/login", (req,res) => {
  const fakeHash = "aosjdoaijieIOEFJI(8327h";
  compare("mySecretPass", fakeHash)
  // if you type a false password, it wont render an error. it'll still resolve, but not gonna work

    .then((isMatch) => {
      console.log("does the password match the one stored? ", isMatch);
      // if returns true, set a cookie that will tell you the user's id -- req.session.userId
      // &&

      //if this value is false, re-render the page with an apropriate error msg
    })
    .catch((err) => {
      console.log("error in comparing password with stored hash");
    });
});