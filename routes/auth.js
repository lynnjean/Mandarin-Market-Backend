var jwt=require('express-jwt');
var secret = require('../config').secret;
var Jwt=require('jsonwebtoken');

const getTokenFromHeader=function(req,res,next){
    if(!req.headers.authorization) return console.log('토큰이 없습니다');

    if (req.headers.authorization && req.headers.authorization.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.authorization.split(' ')[0]==='Bearer'){
        const token= req.headers.authorization.split(' ')[1];
        
        Jwt.verify(token,secret,(err,decoded)=>{
            if(err) return console.log('유효하지 않은 토큰입니다.');
            req.decoded=decoded;
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
module.exports= auth;