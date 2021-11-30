var mongoose=require('mongoose');
var express=require('express');
var router=express.Router();
var passport=require('passport');
var User=mongoose.model('User');
var auth=require('./auth');

// const secret=require('../config').secret;
// var jwt=require('jsonwebtoken');
// const { verify } = require('crypto');
// const { RedisClient } = require('redis');

var list=(req,res,next)=>{
    // console.log(req.payload, ": payload")
    User.findById(req.body.id).then((user)=>{
        if (!user){
            return res.sendStatus(401);
        }
        return res.send(user);
        // return res.json({user:user.toAuthJSON()});
    }).catch(next);
};

var login=(req,res,next)=>{
    if (!req.body.user.email) return res.status(422).json({errors:{email:"can't be blank"}});

    if (!req.body.user.password) return res.status(422).json({errors:{password:"can't be blank"}});

    passport.authenticate('local',{session:false}, (err,user,info)=>{
        if (err) return next(err);
        if (user){
            user.token=user.generateJWT();
            // user.refrashToken=user.refrashJWT();
            return res.json({
                _id:user._id,
                username:user.username,
                email:user.email,
                accountname:user.accountname,
                token:user.generateJWT(),
                // refrashToken=user.refrashJWT()
            });
            // redisClient.set(user.id,refrashToken)
        }else {
            return res.status(422).json(info);
        }
        
    })(req,res,next);
};

var create=(req,res,next)=>{
    var user=new User();
    user.username=req.body.user.username;
    user.accountname = req.body.user.accountname;
    user.email=req.body.user.email;
    user.setPassword(req.body.user.password);
    
    console.log(user);
    user.save().then(()=>{
        console.log(("잘옴?"));
        // return res.json({user:user.toAuthJSON()});
        return res.send("잘옴")
    }).catch(next);
};

var logout=(req,res,next)=>{
    User.findOneAndUpdate({_id:req.user.id},{token:""},(err,user)=>{
        if (err) return res.json({sucess:false,err})
        res.clearCookie("x_auth");
        ctx.cookies.set('access_token');
        return res.status(200).send({sucess:true});
    });
};


router.get('/user',auth.required, list);
router.post('/user',create);
router.post('/user/login',login);
router.get('/user/logout',logout);

module.exports = router;
