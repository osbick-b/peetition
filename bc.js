const bcrypt = require("bcryptjs");

module.exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        // here is the point where i'll definitely have my salt
        return bcrypt.hash(password, salt);
    });
};

module.exports.compare = bcrypt.compare;