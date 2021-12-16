var router=require('express').Router();
const e = require('express');
var mongoose=require('mongoose');
const config = require('../config');
var User=mongoose.model('User');
var auth=require('./auth');

router.use(auth.required) 

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).send("11s");
        req.profile=user;
        next();
    }).catch(next);
})

var account=(req,res,next)=>{
    if(req.payload){
        User.findById(req.payload.id).then((user)=>{
            if(!user){
                return res.json({profile:req.profile.toProfileJSONFor(false)});
            } return res.json({profile:req.profile.toProfileJSONFor(user)})
        });
    }else{
        return res.json({profile:req.profile.toProfileJSONFor(false)});
    }
}

var follows= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id)
    if (!user) return res.status(401);
    user.follow(profileId)
    req.profile.addFollower(req.payload.id)
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor()})
};

var unfollow=(req,res,next)=>{
    var postId=req.post.id;
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);
        
        return user.unhearts(postId).then(function(){
           return req.post.updateHeartCount().then(function(post){
                return res.json({post:req.post.toJSONFor(user)});
           });
        });
    }).catch(next);
};


router.use(auth.required);
router.get('/:accountname',auth.optional,account);
router.post('/:accountname/follow',follows);
router.delete('/:accountname/unfollow', unfollow);

module.exports=router;