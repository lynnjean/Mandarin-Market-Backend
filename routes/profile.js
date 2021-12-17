var router=require('express').Router();
const e = require('express');
var mongoose=require('mongoose');
const config = require('../config');
var User=mongoose.model('User');
var auth=require('./auth');

router.use(auth.required) 

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).send("잘못된 요청입니다.");
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

<<<<<<< HEAD
var followlist=async(req,res,next)=>{
    var limit=10;
    var offset=0;

=======

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

var unfollow= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id);
    if (!user) return res.status(401).sned("존재지 않는 유저입니다.");
    user.unfollow(profileId)
    req.profile.removeFollower(req.payload.id)
    console.log(req.profile)
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor()})
}


var follows= async (req,res,next)=>{
>>>>>>> d57f9c6120ff544d4629f7ca284eb20489ea3086
    var profileId=req.profile.id;

    if (typeof req.query.limit!=='undefined'){
        limit=req.query.limit;
    }
    if (typeof req.query.offset!=='undefined'){
        offset=req.query.offset;
    }
    const user = await User.findById(req.payload.id).limit(Number(limit)).skip(Number(offset)).populate('following')

    if(!user) return res.status(401);
    return res.json(user.following.map((user)=>user.toProfileJSONFor()))
}

var unfollow= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id);
    if (!user) return res.status(401).send("존재하지 않는 유저입니다.");
    user.unfollow(profileId)
    req.profile.removeFollower(req.payload.id)
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor()})
<<<<<<< HEAD
}


var follows= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id);
    if (!user) return res.status(401);
    user.follow(profileId);
    req.profile.addFollower(req.payload.id);
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor()})
=======
>>>>>>> d57f9c6120ff544d4629f7ca284eb20489ea3086
  };
  
router.use(auth.required);
router.get('/:accountname',auth.optional,account);
router.post('/:accountname/follow',follows);
// router.get('/:accountname',auth.optional,account);
// router.get('/:accountname/follow',followlist);
router.delete('/:accountname/unfollow', unfollow);
router.get('/:accountname/follow',followlist);

module.exports=router;