const mongoose = require('mongoose'),
Post = mongoose.model('Post'),
User = mongoose.model('User');

const heart={
    hearton:(req,res,next)=>{
        var postId=req.post.id;
        
        User.findById(req.payload.id).then(function(user){
            if(!user) return res.status(401).json({'message':'존재하지 않는 유저입니다.','status':'401'});
    
            return user.heart(postId).then(function(){
            return req.post.updateHeartCount().then(function(post){
                    return res.json({post:req.post.toJSONFor(user)});
            });
            });
        }).catch(next);
    },
   unheart:(req,res,next)=>{
    var postId=req.post.id;
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
        
        return user.unhearts(postId).then(function(){
           return req.post.updateHeartCount().then(function(post){
                return res.json({post:req.post.toJSONFor(user)});
           });
        });
      }).catch(next);
    }
}

module.exports=heart;