const { use } = require("express/lib/application");
const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

// localhost:5432/dbname ---- port that postgres uses by default
/////// FOR HEROKU -- we're gonna have another version (empty) of our tables and stuff deployed on heroku

//====================================================================//

// ------------ Login ------------- //

module.exports.getCredentials = (email) => {
    return db.query(
        "SELECT password AS saved_pass FROM users WHERE email = $1 ",
        [email]
    );
};

module.exports.getCookieInfo = (email) => {
    return db.query(
        `SELECT users.id AS user_id, users.first, users.last, signatures.user_id AS has_signed
        FROM users LEFT JOIN signatures 
        ON users.id = signatures.user_id 
        WHERE email = $1`,
        [email]
    );
};


// ---------- Cookie info by Id ------- //

module.exports.getCookieById = (user_id) => {
    return db.query(
        `SELECT users.id AS user_id, users.first, users.last, signatures.user_id AS has_signed
        FROM users LEFT JOIN signatures 
        ON users.id = signatures.user_id 
        WHERE users.id = $1`,
        [user_id]
    );
};

// ------------ Register ------------- //

module.exports.registerUser = (first, last, email, password) => {
    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id AS user_id, first, last",
        [first, last, email, password]
    );
};

// ------------- Set Profile ------------- //
module.exports.setProfile = (city, age, website, user_id) => {
    return db.query(
        "INSERT INTO user_profiles (city, age, website, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [city, age, website, user_id]
    );
};

// ------------- Edit Profile ------------- // +++ NOT DONE JUST COPIED
// module.exports.editProfile = // ++++ UPSERT THINGIE goes here

    // -------------- Get Profile -------------- //
    module.exports.getProfile = (user_id) => {
        return db.query(
            `SELECT users.first, users.last, users.email, user_profiles.city, user_profiles.age, user_profiles.website
                FROM users
                FULL OUTER JOIN user_profiles
                ON users.id = user_profiles.user_id
                WHERE users.id = $1`,
            [user_id]
        );
    };

// ------------- Sign Petition ------------- //

module.exports.signPetition = (signature, user_id) => {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING user_id AS has_signed",
        [signature, user_id]
    );
};

// ------------ Delete Signature ------------- //
module.exports.deleteSignature = (user_id) => {
    console.log("in db.deleteSign", user_id);
    return db.query(
        "DELETE FROM signatures WHERE user_id = $1 RETURNING user_id",
        [user_id]
    );
};


// ------------ Get List of Signers ------------- //
module.exports.getListSigners = () => {
    return db.query(`SELECT  users.first, users.last, user_profiles.city, user_profiles.age, user_profiles.website 
    FROM users
    INNER JOIN signatures ON users.id = signatures.user_id
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    `);
};
// add after from ---     INNER JOIN signatures ON users.id = signatures.user_id

// ------------ Get List of Signers BY CITY------------- //
module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.city, user_profiles.age, user_profiles.website
        FROM users
        LEFT JOIN signatures ON users.id = signatures.user_id
        LEFT JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE LOWER(user_profiles.city) = LOWER($1)`,
        [city]
    );
};

// ------------ Retrieve signature canvas ------------- //
module.exports.getCanvasSignature = (user_id) => {
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [user_id]);
};

// UPSERT THINGIE
module.exports.updateRegister = (userInput, user_id) => {
    const u = userInput;
    return db.query(
        `UPDATE users 
        SET first = $1, last = $2, email = $3
        WHERE id = $4
        RETURNING first, last, email`,
        [u.first, u.last, u.email, user_id]
    );
};

module.exports.updatePassword = (hashedPass, user_id) => {
    console.log("userInput inside DB in updatePass:", hashedPass);
    return db.query(
        `UPDATE users 
        SET password = $1
        WHERE id = $2
        RETURNING password`,
        [hashedPass, user_id]
    );
};

module.exports.updateProfile = (userInput, user_id) => {
    console.log("in db updateprofile", userInput);
    const u = userInput;
    return db.query(
        `INSERT INTO user_profiles (city, age, website, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET city = $1, age = $2, website = $3
        WHERE user_profiles.user_id = $4
        RETURNING city, age, website, user_id`,
        [u.city, u.age, u.website, user_id]
    );
};
