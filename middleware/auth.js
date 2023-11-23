const jwt = require('jsonwebtoken')
const CustomError = require('../lib/CustomError')

function isUserAuthenticated(req, res, next){
    // get cookie from request
    const token = req.cookies.session
    const user = req.cookies.user
    if(!token || !user){
        res.status(401).redirect('/login')
        return
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

