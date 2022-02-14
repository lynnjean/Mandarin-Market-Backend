const mongoose = require('mongoose'),
Post = mongoose.model('Post'),
User = mongoose.model('User'),
Comment = mongoose.model('Comment'),
Report=mongoose.model('Report');

const comment={
    commentlist:function(req, res, next){
        const limit = req.query.limit ? Number(req.query.limit):10
        const skip = req.query.skip ? Number(req.query.skip):0
        
        Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
          return req.post.populate({
            path: 'comments',
            populate: {
              path: 'author'
            },
            options: {
              sort: {
                createdAt: 'desc'
              },
              limit:limit,
              skip:skip
            }
          }).then(function(post) {
            return res.json({comments: req.post.comments.map(function(comment){
              return comment.toJSONFor(user);
            })});
          });
        }).catch(next);
    },
    comment:function(req, res, next) {
        User.findById(req.payload.id).then(function(user){
          if(!user) return res.status(401).json({'message':'존재하지 않는 유저입니다.','status':'401'});
      
          var comment = new Comment(req.body.comment);
        
          comment.post = req.post;
          comment.author = user;
          
          return comment.save().then(function(){
            req.post.comments.push(comment);
            return req.post.save().then(function(post) {
              res.json({comment: comment.toJSONFor(user)});
            });
          });
        }).catch(next);
    },
    uncomment: async function(req, res, next) {
        const post = await Post.findById(req.post._id)
        if(req.comment.author.toString() === req.payload.id.toString()){
            const comment=await Comment.find({_id: req.comment._id}).remove().exec()
            post.comments.remove(req.comment._id)
            await Post.findByIdAndUpdate(req.post._id,{comments:post.comments})
            return res.status(200).json({'message':'댓글이 삭제되었습니다.','status':'200'});
        } else {
            res.status(403).json({'message':'댓글 작성자만 댓글을 삭제할 수 있습니다.','status':'403'});
        }
    },
    commentReport:(req,res,next)=>{
        User.findById(req.payload.id).then(function(user){
          if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
          var report = new Report();
          report.comment = req.comment._id;
          report.save()
          return res.json({report: report.toJSONFor(user)});
        }).catch(next);
    }

}

module.exports=comment;