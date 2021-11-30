var jwt=require('express-jwt');
var secret = require('../config').secret;
var Jwt=require('jsonwebtoken');

//refrash
// var redis=require('redis');
// var redisClient=redis.createClient(process.env.REDIS_PORT);
// var {promisify}=require('util');


function getTokenFromHeader(req,res,next){
    if (req.headers.authorization && req.headers.authorization.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.authorization.split(' ')[0]==='Bearer'){
        // return req.headers.authorization.split(' ')[1];
        var token= req.headers.authorization.split(' ')[1];

        const result=(token)=>{
            let decoded=null;

            try{
                decoded=Jwt.verify(token,secret,(err,decoded)=>{
                    if(err){
                        console.log("jwt.verify ERROR")
                        return res.json({ success: false, message: 'Failed to authenticate token.', err:err });
                    }
                    else{
                        console.log("jwt.verify OK")
                        req.decoded = decoded;
                        next;
                    }
                })
            }catch (err){
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            }
        }
        return token;
    }return null;
}

// function refrashGetTokenFromHeader(req,res,next){
//     if (req.headers.authorization && req.headers.refrash.split(' ')[0]==='Token'||
//     req.headers.authorization && req.headers.refrash.split(' ')[0]==='Bearer'){
//         // return req.headers.authorization.split(' ')[1];
//         var authToken= req.headers.authorization.split(' ')[1];

//         var refrashToken=req.headers.refrash;

//         const authResult=verify(authToken);
//         const decoded=Jwt.decode(authToken)

//         if(decoded===null){
//             res.status(401).send({ok:false,message:'No authorized!'});
//         }
//         const refreshResult= async (refreshToken,decoded.id)=>{
//             const getAsync=promisify(redisClient.get).bind(redisClient);

//             try{
//                 const data=await getAsync(decoded.id);
//                 if(refreshToken===data){
//                     try{
//                         Jwt.verify(refreshToken,secret);
//                         return true;
//                     }catch (err) {return false}
//                 }else return false;
//             }catch (err) {return false;}
//         }

//     }return null;
// }

var auth={
    required:jwt({
        secret:secret,
        userProperty:'payload',
        getToken:getTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'1h'
    }),
    optional:jwt({
        secret:secret,
        userProperty:'payload',
        credentialsRequired:false,
        getToken:getTokenFromHeader,
        algorithms: ['sha1', 'RS256', 'HS256'],
        expiresIn:'1h'
    })
};

// var refrashauth={
//     required:jwt({
//         secret:secret,
//         userProperty:'payload',
//         getToken:refrashGetTokenFromHeader,
//         algorithms: ['sha1', 'RS256', 'HS256'],
//         expiresIn:'14d'
//     }),
//     optional:jwt({
//         secret:secret,
//         userProperty:'payload',
//         credentialsRequired:false,
//         getToken:refrashGetTokenFromHeader,
//         algorithms: ['sha1', 'RS256', 'HS256'],
//         expiresIn:'14d'
//     }),
// }

module.exports=auth;