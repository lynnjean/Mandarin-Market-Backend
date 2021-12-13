var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Report=mongoose.model('Report');
var express=require('express');
const auth = require('./auth');
const { post } = require('./profile');
var router=express.Router();

router.param('post', async function(req, res, next, postId) {
  // console.log("middle", postId);
  Post.findOne({ _id: postId})
    .populate('author')
    .then(function (post) {
      if (!post) { return res.status(404).send("존재하지않는 게시글입니다."); }
      req.post = post;
      return next();
    }).catch(next);
});

router.param('user', async function(req, res, next, userId) {
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).send("존재하지않는 유저입니다.")
    }
    req.user = user
  return next()
})

const createPost = async function createPost(req, res, next) {
    const user = await User.findById(req.payload.id)
    const post = new Post(req.body.post)
    post.author = user
    await post.save()
    // console.log(user)

    return res.json({post:post.toJSONFor(user)})
}

const getPosts = async function getPosts(req,res,){
  const limit = req.query.limit ? Number(req.query.limit):10 
  const skip = req.query.skip ? Number(req.query.skip):0
  const posts = await Post.find({}).sort({createdAt:'descending'}).skip(skip).limit(limit).populate('author');
  res.status('200').json({
      status: 'ok',
      data: posts.length,
      posts,
  })
}

const getPostById = async function getPost(req, res, next) {
  const user = await User.findById(req.payload.id)
  await req.post.populate('author')
  // console.log(req.post)
  return res.json({post: req.post.toJSONFor(user)})
}

const updatePost = async function updatePost(req, res, next){
  if(req.payload.id.toString() === req.post.author._id.toString()){
      await Post.findByIdAndUpdate(req.post._id,req.body.post)
      const user = await User.findById(req.payload.id)
      const post = await Post.findById(req.post.id).populate('author')
      return res.json({post: post.toJSONFor(user)})
  }
  return res.status(403).send("잘못된 요청입니다. 로그인 정보를 확인하세요")
}

const getFeed = async function getPostByFollowing(req,res){
  const limit = req.query.limit ? Number(req.query.limit):10 
  const skip = req.query.skip ? Number(req.query.skip):0
  const user = await User.findById(req.payload.id)
  const posts = await Post.find({ author:{$in: user.following}}).sort({createdAt:'descending'}).limit(limit).skip(skip).populate('author')
  return res.status(200).json({posts: posts.map(post=>post.toJSONFor())})
}

const removePost = async function removePost(req, res,){
  if(req.payload.id.toString() === req.post.author._id.toString()){
      await Post.findByIdAndDelete(req.post._id,req.body.post)
      return res.send("삭제되었습니다.")
  }
  return res.status(403).send("잘못된 요청입니다. 로그인 정보를 확인하세요")
}

const postReport=(req,res,next)=>{
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    var report = new Report();
    report.post = req.post._id;

    report.save()
    return res.json({report: report.toJSONFor(user)});
  }).catch(next);
}

router.use(auth.required) 

router.post('/', createPost); //0
router.get('/', getPosts); //0
router.get('/feed',getFeed);//0
router.get('/:post', getPostById); //0
router.put('/:post', updatePost); //0
router.delete('/:post', removePost); //0
router.post('/:post/report',postReport)//0

//heart
var hearton=(req,res,next)=>{
  var postId=req.post.id;
  
  User.findById(req.payload.id).then(function(user){
      if (!user) return res.status(401);

      return user.heart(postId).then(function(){
         return req.post.updateHeartCount().then(function(post){
              return res.json({post:req.post.toJSONFor(user)});
         });
      });
  }).catch(next);
};

var unheart=(req,res,next)=>{
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

router.post('/:post/heart',hearton); //0
router.delete('/:post/heart',unheart); //0

//comment
router.param('comment', function(req, res, next, id) {
    Comment.findById(id).then(function(comment){
      if(!comment) { return res.sendStatus(404); }
      req.comment = comment;
      return next();
    }).catch(next);
  });

var commentlist=function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.post.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).then(function(post) {
      return res.json({comments: req.post.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
};

var comment=function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

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
};

var uncomment=function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
      req.post.comments.remove(req.comment._id);
      req.post.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
          res.sendStatus(204);
      });
  } else {
      res.sendStatus(403);
  }
};

const commentReport=(req,res,next)=>{
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    var report = new Report();
    report.comment = req.comment._id;

    report.save()
    return res.json({report: report.toJSONFor(user)});
  }).catch(next);
}

router.get('/:post/comments', commentlist); //0
router.post('/:post/comments', comment); //0
router.delete('/:post/coremments/:comment', uncomment); //0
router.post('/:post/comments/:comment/report', commentReport); //0

module.exports = router;