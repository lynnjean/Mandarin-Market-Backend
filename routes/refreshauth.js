var jwt=require('express-jwt');
var secret = require('../config').secret;
var Jwt=require('jsonwebtoken');

function refreshGetTokenFromHeader(req,res,next){
    console.log(req.headers.authorization)
    if (req.headers.authorization && req.headers.refresh.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.refresh.split(' ')[0]==='Bearer'){
        var refreshToken=req.headers.authorization.split(' ')[1];

        if(!refreshToken){
            console.log(error)
            return res.status(401);
        }

        Jwt.verify(refreshToken,secret,(error,user)=>{
            if(error){
                console.log(error);
                return res.status(403);
            }
            var token= user.generateJWT();
            res.json({token});
        });
        return token;
    }return null;
}

var refreshAuth={
    required:jwt({
        secret:secret,
        userProperty:'payload',
        getToken:refreshGetTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'14d'
    }),
    optional:jwt({
        secret:secret,
        userProperty:'payload',
        credentialsRequired:false,
        getToken:refreshGetTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'14d'
    }),
}

module.exports=refreshAuth;