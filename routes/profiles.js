var router=require('express').Router();
const e = require('express');
var mongoose=require('mongoose');
const config = require('../config');
var User=mongoose.model('User');
var auth=require('./auth');

router.use(auth.required) 

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404);
        req.profile=user;
        next();
    }).catch(next);
})

router.get('/:accountname',auth.optional,(req,res,next)=>{
    if(req.payload){
        User.findById(req.payload.id).then((user)=>{
            if(!user){
                return res.json({profile:req.profile.toProfileJSONFor(false)});
            } return res.json({profile:req.profile.toProfileJSONFor(user)})
        });
    }else{
        return res.json({profile:req.profile.toProfileJSONFor(false)});
    }
})

router.get('/:accountname/follow',function(req,res,next){
    var profileId=req.profile.id;

    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);
        return user.follow(profileId).then(function(){
            return res.send(user.following)
        })
    }).catch(next);
})

router.post('/:accountname/follow', function(req,res,next){
    var profileId=req.profile.id;

    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);

        return user.follow(profileId).then(function(){
            return res.json({profile:req.profile.toProfileJSONFor(user),follower:user.following});
        });
    }).catch(next);
})

router.delete('/:accountname/follow', function(req,res,next){
    var profileId=req.profile.id;
    
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);

        return user.unfollows(profileId).then(function(){
            return res.json({profile:req.profile.toProfileJSONFor(user)});
        });
    }).catch(next);
})

module.exports=router;