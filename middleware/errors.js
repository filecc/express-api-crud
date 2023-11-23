const fs = require("fs");
const path = require("path");


module.exports = function (err, req, res, next) {
    res.json({
        error: err.message,
        code: err.statusCode
    })
};