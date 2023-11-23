const jwt = require('jsonwebtoken')
const CustomError = require('../lib/CustomError')

function isUserAuthenticated(req, res, next){
    // get cookie from request
    const token = req.headers["authorization"];

    if(!token){
        throw new CustomError('API KEY not present.', 401)
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if(err){
            res.clearCookie('session')
            res.clearCookie('user')
            throw new CustomError('Your credentials are expired. Go back to login page.', 401)
        } else {
            next()
            return
        }
    })   
}

module.exports = isUserAuthenticated

