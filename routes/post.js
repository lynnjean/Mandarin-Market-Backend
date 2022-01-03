var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Report=mongoose.model('Report');
var express=require('express');
const auth = require('./auth');
const { post } = require('./profile');
var router=express.Router();

router.use(auth.required) 

router.param('post', async function(req, res, next, postId) {
  Post.findById(postId).populate('author').then(function(post) {
      req.post = post;
      return next();
    }).catch(()=>{return res.status(404).json({'message':"존재하지 않는 게시글입니다.",'status':404})});
});

router.param('user', async function(req, res, next, userId) {
  const user = await User.findById(userId)
  if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
  req.user = user
return next()
})

const createPost = async function createPost(req, res, next) {
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
}

const getPosts = async function getPosts(req,res){
  const limit = req.query.limit ? Number(req.query.limit):10 
  const skip = req.query.skip ? Number(req.query.skip):0
  const posts = await Post.find({}).limit(limit).skip(skip).sort({createdAt:'descending'}).populate('author')

  res.status('200').json({
      data: posts.length,
      posts,
  })
}

const getPostById = async function getPost(req, res, next) {
  const user = await User.findById(req.payload.id)
  await req.post.populate('author')
  return res.status(200).json({post: req.post.toJSONFor(user)})
}

router.param('accountname',(req,res,next,accountname)=>{
  User.findOne({accountname:accountname}).then((user)=>{
      if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
      req.user=user;
      next();
  }).catch(next);
})

const userPost = async function userPost(req, res, next) {
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
}

const updatePost = async function updatePost(req, res, next){
  if(req.payload.id.toString() === req.post.author._id.toString()){
      await Post.findByIdAndUpdate(req.post._id,req.body.post)
      const user = await User.findById(req.payload.id)
      const post = await Post.findById(req.post.id).populate('author')
      return res.json({post: post.toJSONFor(user)})
  }
  return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
}

const getFeed = async function getPostByFollowing(req,res){
  const limit = req.query.limit ? Number(req.query.limit):10 
  const skip = req.query.skip ? Number(req.query.skip):0
  const user = await User.findById(req.payload.id)
  if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
  const posts = await Post.find({ author:{$in: user.following}}).sort({createdAt:'descending'}).limit(limit).skip(skip).populate('author')
  return res.status(200).json({posts: posts.map(post=>post.toJSONFor(user))})
}

const removePost = async function removePost(req, res,){  
  if(req.payload.id.toString() === req.post.author._id.toString()){
      // const users=await User.find({hearts:req.post._id})
      // users.map(user=>user.unhearts(req.post._id))
      // console.log(user)
      await Post.findByIdAndDelete(req.post._id,req.body.post)
      return res.status(200).json({'message':"삭제되었습니다.",'status':'200'})
  }
  return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
}

const postReport=(req,res,next)=>{
  User.findById(req.payload.id).then(function(user){
    if(!user) return res.status(401).json({'message':'존재하지 않는 유저입니다.','status':'401'});
    var report = new Report();
    report.post = req.post._id;
    report.save()
    return res.json({report: report.toJSONFor(user)});
  }).catch(next);
}

router.post('/', createPost);
router.get('/', getPosts); 
router.get('/feed',getFeed);
router.get('/:post', getPostById);
router.get('/:accountname/userpost',userPost)
router.put('/:post', updatePost); 
router.delete('/:post', removePost); 
router.post('/:post/report',postReport);

//heart
var hearton=(req,res,next)=>{
  var postId=req.post.id;
  
  User.findById(req.payload.id).then(function(user){
      if(!user) return res.status(401).json({'message':'존재하지 않는 유저입니다.','status':'401'});

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
      if (!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
      
      return user.unhearts(postId).then(function(){
         return req.post.updateHeartCount().then(function(post){
              return res.json({post:req.post.toJSONFor(user)});
         });
      });
  }).catch(next);
};

router.post('/:post/heart',hearton); //0
router.delete('/:post/unheart',unheart); //0

//comment
router.param('comment', function(req, res, next, id) {
    Comment.findById(id).then(function(comment){
      req.comment = comment;
      return next();
    }).catch(()=>{return res.status(404).json({'message':'댓글이 존재하지 않습니다.','status':'404'})});
  });

var commentlist=function(req, res, next){
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
};

var comment=function(req, res, next) {
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
};

var uncomment= async function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
      Comment.find({_id: req.comment._id}).remove().exec()
      return res.status(200).json({'message':'댓글이 삭제되었습니다.','status':'200'});
  } else {
      res.status(403).json({'message':'댓글 작성자만 댓글을 삭제할 수 있습니다.','status':'403'});
  }
};

const commentReport=(req,res,next)=>{
  User.findById(req.payload.id).then(function(user){
    if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
    var report = new Report();
    report.comment = req.comment._id;
    report.save()
    return res.json({report: report.toJSONFor(user)});
  }).catch(next);
}

router.get('/:post/comments', commentlist); //0
router.post('/:post/comments', comment); //0
router.delete('/:post/comments/:comment', uncomment); //0
router.post('/:post/comments/:comment/report', commentReport); //0

module.exports = router;