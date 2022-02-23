const req = require("express/lib/request");

module.exports.layoutMain = (title, data = null) => {
    const hdlbConfig = {
        dataToRender: data,
        title: `${title} - MyPetition`,
        layout: "main",
    };
    return hdlbConfig;
};

module.exports.hasUserSigned = (req) => {
    console.log("--- you've already signed!");
    return req.session.hasSigned;
}

// -------- Edit Profile -------- // +++ NOT DONE
module.exports.editProfile = (req) => {
    const { first, last, email, password, passconfirm, city, age, website } =
        req.body;
    // +++ VALIDATE URL
    console.log("in nif -- editProfile ",
        first,
        last,
        email,
        password,
        passconfirm,
        city,
        age,
        website,
        req.session.user_id
    );
    return db
        .editProfile(
            first,
            last,
            email,
            password,
            passconfirm,
            city,
            age,
            website,
            req.session.user_id)
};