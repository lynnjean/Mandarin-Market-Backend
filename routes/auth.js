var jwt=require('express-jwt');
var secret = require('../config').secret;
var Jwt=require('jsonwebtoken');

// const getTokenFromHeader=(req,res,next)=>{
//     const token= req.headers.authorization.split(' ')[1];
//     if(!token) return res.status(400).json({'message':'토큰이 없습니다.','status':400});
//     const p=new Promise((resolve,reject)=>{
//         Jwt.verify(token,secret,(err,decoded)=>{
//             if(err) reject(err);
//             else resolve(decoded);
//         });
//     })
//     const onError=(error)=>{
//         return error
//     }

//     p.then((decoded)=>{
//         return res.json(decoded)
//     }).catch(()=>{return res.json({'error':error,'message':'유효하지 않은 토큰입니다.'})})
// }

function getTokenFromHeader(req,res,next){
    if(req.headers.authorization==='undefined') return res.status(400).json({'message':'토큰이 없습니다.','status':400});

    if (req.headers.authorization && req.headers.authorization.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.authorization.split(' ')[0]==='Bearer'){
        const token= req.headers.authorization.split(' ')[1];
        if(!req.headers.authorization) return res.status(400).json({'message':'토큰이 없습니다.','status':400});

        Jwt.verify(token,secret,(err,user)=>{
            if(err) return res.status(403).json({'message':'잘못된 토큰입니다.','status':403});
            req.user=user;
            next;
        });

        return token;
    }return res.status(400).json({'message':'토큰이 없습니다.','status':400});
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