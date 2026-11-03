var jwt = require('jsonwebtoken');

function generateToken(payload){
    const signOption = {
        expiresIn: process.env.JWT_EXPIRES_IN
    }
    return jwt.sign(payload, process.env.JWT_SECRET, signOption);
}

function verifyToken(token){
    return jwt.verify(token, process.env.JWT_SECRET);
}

// TODO: auth middleware function 

function tokenchecker(req, res, next){

    const authHeader = req.headers['authorization']; //bearer *token*
    const token = authHeader.split(' ')[1]; //get the token from the header
    if(!token){
        return res.status(401).json({error: 'Access denied. No token provided.'});
    }
    try{
        const decoded = verifyToken(token);
        req.user = decoded; //attach the decoded payload to the request object
        next();
    }catch(err){
        return res.status(400).json({error: 'Invalid token or expired.'});
    }
}

module.exports = {
    generateToken,
    verifyToken,
    tokenchecker
}
