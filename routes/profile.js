var router=require('express').Router();
const e = require('express');
var mongoose=require('mongoose');
const config = require('../config');
var User=mongoose.model('User');
var auth=require('./auth');

router.use(auth.required) 

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.profile=user;
        next();
    }).catch(next);
})

var account=(req,res,next)=>{
    User.findById(req.payload.id).then((user)=>{
        return res.json({profile:req.profile.toProfileJSONFor(user)})
    });
}

var followinglist=async(req,res,next)=>{
    const limit = req.query.limit ? Number(req.query.limit):10
    const skip = req.query.skip ? Number(req.query.skip):0

    Promise.resolve(req.profile.id ? User.findById(req.profile.id) : null).then(function(user){
        return user.populate({
          path: 'following',
          options: {
            limit:limit,
            skip:skip
          }
        }).then(async function(user) {
          const me = await User.findById(req.payload.id)
          return res.json(user.following.map((following)=>following.toProfileJSONFor(me)))
        });
      }).catch(next);
}

var followerlist=async(req,res,next)=>{
    const limit = req.query.limit ? Number(req.query.limit):10
    const skip = req.query.skip ? Number(req.query.skip):0

    Promise.resolve(req.profile.id ? User.findById(req.profile.id) : null).then(function(user){
        return user.populate({
          path: 'follower',
          options: {
            limit:limit,
            skip:skip
          }
        }).then(async function(user) {
            const me = await User.findById(req.payload.id)
            return res.json(user.follower.map((follower)=>follower.toProfileJSONFor(me)))
          });
      }).catch(next);
}

var follows= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id);
    if (!user) return res.status(401);
    if (user._id.toString()===profileId.toString()) return res.status(200).json({message:'자기 자신을 팔로우 할 수 없습니다.'})
    user.follow(profileId);
    req.profile.addFollower(req.payload.id);
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor(user)})
};

var unfollow= async (req,res,next)=>{
    var profileId=req.profile.id;
    const user =  await User.findById(req.payload.id);
    user.unfollow(profileId)
    req.profile.removeFollower(req.payload.id)
    await User.findByIdAndUpdate(req.payload.id, user)
    await User.findByIdAndUpdate(profileId, req.profile)
    return res.json({profile:req.profile.toProfileJSONFor(user)})
}
  
router.get('/:accountname',auth.optional,account);
router.post('/:accountname/follow',follows);
router.delete('/:accountname/unfollow', unfollow);
router.get('/:accountname/following',followinglist);
router.get('/:accountname/follower',followerlist);


module.exports=router;