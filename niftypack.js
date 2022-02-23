const req = require("express/lib/request");

module.exports.layoutMain = (title, data) => {
    const hdlbConfig = {
        dataToRender: data,
        title: `${title} - MyPetition`,
        layout: "main",
    };
    return hdlbConfig;
};

module.exports.checkForSign = (req) => {
    console.log("req.session --- in fn checkForSign", req.session);
    return req.session.hasSigned;
}