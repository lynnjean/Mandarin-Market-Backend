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
        // console.log(req.profile)
        // console.log(req.user)
        next();
    }).catch(next);
})

// var account=(req,res,next)=>{
//     if(req.payload){
//         User.findById(req.payload.id).then((user)=>{
//             if(!user){
//                 return res.json({profile:req.profile.toProfileJSONFor(false)});
//             } return res.json({profile:req.profile.toProfileJSONFor(user)})
//         });
//     }else{
//         return res.json({profile:req.profile.toProfileJSONFor(false)});
//     }
// }

// var followlist=(req,res,next)=>{
//     var limit=10;
//     var offset=0;

//     var profileId=req.profile.id;

//     if (typeof req.query.limit!=='undefined'){
//         limit=req.query.limit;
//     }
//     if (typeof req.query.offset!=='undefined'){
//         offset=req.query.offset;
//     }

//     User.findById(req.payload.id).limit(Number(limit)).skip(Number(offset)).then(function(user){
//         if (!user) return res.status(401);
//         return user.follow(profileId).then(function(){
//             return res.send(user.following)
//         })
//     }).catch(next);
// }

// var follows=async function(req,res,next){
//     targetUser=User.findById(req.profile._id)
//     console.log(targetUser)
//     User.findById(req.payload.id).then(function(user){
//         if (!user || !targetUser) return res.status(401);

//         return user.follow(req.profile._id).then(function(){
            
//             return res.json({profile:req.profile.toProfileJSONFor(user)});
//         });
//     }).catch(next);
// }

// var unfollow=(req,res,next)=>{
//     var profileId=req.profile.id;
    
//     User.findById(req.payload.id).then(function(user){
//         if (!user) return res.status(401);

//         return user.unfollows(profileId).then(function(){
//             return res.json({profile:req.profile.toProfileJSONFor(user)});
//         });
//     }).catch(next);
// }


var follows=(req,res,next)=>{
    var profileId=req.profile.id;

    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);
  
        return user.follow(profileId).then(function(){
           return user.addFollower().then(function(user){
                return res.json({profile:req.profile.toProfileJSONFor()});
           });
        });
    }).catch(next);
  };
  
// var unfollow=(req,res,next)=>{
//     var postId=req.post.id;
//     User.findById(req.payload.id).then(function(user){
//         if (!user) return res.status(401);
        
//         return user.unhearts(postId).then(function(){
//            return req.post.updateHeartCount().then(function(post){
//                 return res.json({post:req.post.toJSONFor(user)});
//            });
//         });
//     }).catch(next);
//   };



router.use(auth.required);
router.post('/:accountname/follow',follows);
// router.get('/:accountname',auth.optional,account);
// router.get('/:accountname/follow',followlist);
// router.delete('/:accountname/follow', unfollow);

module.exports=router;