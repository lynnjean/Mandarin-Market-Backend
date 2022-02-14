const mongoose = require('mongoose'),
Post = mongoose.model('Post'),
User = mongoose.model('User'),
Report=mongoose.model('Report');

const post={
    createPost:async function createPost(req, res, next) {
        const user = await User.findById(req.payload.id)
        if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
        const post = new Post(req.body.post)
        if(!req.body.post||(!req.body.post.content&&!req.body.post.image)) return res.status(422).json({'message':'내용 또는 이미지를 입력해주세요.','status':'422'})
        post.author = user
        try{
          await post.save().then(()=>{
            return res.status(200).json({post:post.toJSONFor(user)})
          })
        }
        catch(error){
          next;
        }
    },
    getPosts : async function getPosts(req,res){
        const limit = req.query.limit ? Number(req.query.limit):10 
        const skip = req.query.skip ? Number(req.query.skip):0
        const posts = await Post.find({}).limit(limit).skip(skip).sort({createdAt:'descending'}).populate('author')
      
        res.status('200').json({
            data: posts.length,
            posts,
        })
    },
    getPostById : async function getPost(req, res, next) {
        const user = await User.findById(req.payload.id)
        await req.post.populate('author')
        return res.status(200).json({post: req.post.toJSONFor(user)})
    },
    userPost : async function userPost(req, res, next) {
        const limit = req.query.limit ? Number(req.query.limit):10 
        const skip = req.query.skip ? Number(req.query.skip):0
        try {
          const user = await User.findById(req.payload.id)
          const post = await Post.find({author:req.user}).limit(limit).skip(skip).sort({createdAt:'descending'}).populate('author')
          return res.status(200).json({post:post.map(post=>post.toJSONFor(user))})
          } 
        catch (error) {
            next()
        }
    },
    updatePost : async function updatePost(req, res, next){
        if(req.payload.id.toString() === req.post.author._id.toString()){
            await Post.findByIdAndUpdate(req.post._id,req.body.post)
            const user = await User.findById(req.payload.id)
            const post = await Post.findById(req.post.id).populate('author')
            return res.json({post: post.toJSONFor(user)})
        }
        return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    },
    getFeed : async function getPostByFollowing(req,res){
        const limit = req.query.limit ? Number(req.query.limit):10 
        const skip = req.query.skip ? Number(req.query.skip):0
        const user = await User.findById(req.payload.id)
        if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
        const posts = await Post.find({ author:{$in: user.following}}).sort({createdAt:'descending'}).limit(limit).skip(skip).populate('author')
        return res.status(200).json({posts: posts.map(post=>post.toJSONFor(user))})
    },
    removePost : async function removePost(req, res){ 
        if(req.payload.id.toString() === req.post.author._id.toString()){
          const user=await User.find({hearts:req.post._id})
          user.map(async user=>{
            await user.unhearts(req.post._id)
            await User.findByIdAndUpdate(user._id, user)
          })
      
          await Post.findByIdAndDelete(req.post._id,req.body.post)
          return res.status(200).json({'message':"삭제되었습니다.",'status':'200'})
        }
        return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    },
    postReport:(req,res,next)=>{
        User.findById(req.payload.id).then(function(user){
          if(!user) return res.status(401).json({'message':'존재하지 않는 유저입니다.','status':'401'});
          var report = new Report();
          report.post = req.post._id;
          report.save()
          return res.json({report: report.toJSONFor(user)});
        }).catch(next);
    }
}

module.exports=post;