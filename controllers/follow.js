const mongoose=require('mongoose'),
User=mongoose.model('User');

const follow={
    followinglist:async(req,res,next)=>{
        const limit = req.query.limit ? Number(req.query.limit):10
        const skip = req.query.skip ? Number(req.query.skip):0
    
        Promise.resolve(req.profile.id ? User.findById(req.profile.id) : null).then(function(user){
            return user.populate({
              path: 'following',
              options: {
                limit:limit,
                skip:skip
              }
            }).then(function(user) {
                return res.json(user.following.map((user)=>user.toProfileJSONFor()))
              });
          }).catch(next);
    },
    followerlist:async(req,res,next)=>{
        const limit = req.query.limit ? Number(req.query.limit):10
        const skip = req.query.skip ? Number(req.query.skip):0
    
        Promise.resolve(req.profile.id ? User.findById(req.profile.id) : null).then(function(user){
            return user.populate({
              path: 'follower',
              options: {
                limit:limit,
                skip:skip
              }
            }).then(function(user) {
                return res.json(user.follower.map((user)=>user.toProfileJSONFor()))
              });
          }).catch(next);
    },
    follows: async (req,res,next)=>{
        var profileId=req.profile.id;
        const user =  await User.findById(req.payload.id);
        if (!user) return res.status(401);
        if (user._id.toString()===profileId.toString()) return res.status(200).json({message:'자기 자신을 팔로우 할 수 없습니다.'})
        user.follow(profileId);
        req.profile.addFollower(req.payload.id);
        await User.findByIdAndUpdate(req.payload.id, user)
        await User.findByIdAndUpdate(profileId, req.profile)
        return res.json({profile:req.profile.toProfileJSONFor(user)})
    },
    unfollow: async (req,res,next)=>{
        var profileId=req.profile.id;
        const user =  await User.findById(req.payload.id);
        user.unfollow(profileId)
        req.profile.removeFollower(req.payload.id)
        await User.findByIdAndUpdate(req.payload.id, user)
        await User.findByIdAndUpdate(profileId, req.profile)
        return res.json({profile:req.profile.toProfileJSONFor()})
    }
}

module.exports=follow;
