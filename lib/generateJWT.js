const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const CustomError = require('./CustomError');


function generateJWT(req, res) {

    const users = JSON.parse(fs.readFileSync(path.resolve('./db/users.json'), 'utf8'));
    const profile = users.find((user) => user.username == req.body.username && user.password == req.body.password);

    if(!profile) {
        throw new CustomError('Email o password non validi', 777);
    }

    const payload = {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        email: profile.email,
    }

    const token = jwt.sign({user: {...payload}}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('user', payload, { httpOnly: true, expires: new Date(Date.now() + 3600000)  });
    res.cookie('session', token, { httpOnly: true, expires: new Date(Date.now() + 3600000)});
   
    return token;
}

module.exports = generateJWT;