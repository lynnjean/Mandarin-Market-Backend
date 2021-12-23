var jwt=require('express-jwt');
var secret = require('../config').secret;
var Jwt=require('jsonwebtoken');

function getTokenFromHeader(req,res,next){
    if (req.headers.authorization && req.headers.authorization.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.authorization.split(' ')[0]==='Bearer'){
        let token= req.headers.authorization.split(' ')[1];

        if(!token){
            console.log(error)
            return res.status(400);
        }

        Jwt.verify(token,secret,(error,user)=>{
            if(error){
                console.log(error);
                return res.status(403);
            }
            req.user=user;
            next;
        });
        return token;
    }return null;
}

var auth={
    required:jwt({
        secret:secret,
        userProperty:'payload',
        getToken:getTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'2000h'
    }),
    optional:jwt({
        secret:secret,
        userProperty:'payload',
        credentialsRequired:false, //권한 요구할 필요 없음
        getToken:getTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'2000h'
    })
};

module.exports=auth;