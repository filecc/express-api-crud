const path = require("path")

module.exports = function (req, res, next) {
    res.json({error: 404, message: `Page not found` })
}