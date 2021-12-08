var mongoose = require('mongoose')
var Post = mongoose.model('Post')
var User = mongoose.model('User')
var Comment = mongoose.model('Comment');
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.param('post', async function(req, res, next, postId) {
    console.log("middle", postId);
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
    return res.json({post: post.toJSONFor(user)})
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
  console.log(req.post)
  return res.json({post: req.post.toJSONFor(user)})
}
const getPostByUserId = async function getPostByuserId(req, res, next) {
    const limit = req.query.limit ? Number(req.query.limit):10 
    const skip = req.query.skip ? Number(req.query.skip):0
    const posts = await Post.find({author:req.user}).sort({createdAt:'descending'}).skip(skip).limit(limit).populate("author")
    return res.json({posts:posts.map((post)=>post.toJSONFor())})
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

const removePost = async function removePost(req, res,){
  if(req.payload.id.toString() === req.post.author._id.toString()){
      await Post.findByIdAndDelete(req.post._id,req.body.post)
      return res.send("삭제되었습니다.")
  }
  return res.status(403).send("잘못된 요청입니다. 로그인 정보를 확인하세요")
}
router.use(auth.required)

router.get('/', getPosts)
router.post('/', createPost);
router.get('/:post', getPostById)
router.delete('/:post', removePost);
router.put('/:post', updatePost);
router.get('/search/:user', getPostByUserId)



router.param('comment', async function(req, res, next, id) {
    const comment = Comment.findById(id)
    if(!comment){
      return res.status(404).send("댓글이 존재하지 않습니다.")
    }
    req.comment = comment;
    return next()
  });

router.get('/:post/comments', async function(req, res, next){
    const limit = req.query.limit ? Number(req.query.limit):10 
    const skip = req.query.skip ? Number(req.query.skip):0

    const user = await User.findById(req.payload.id)
    const post = await req.post.limit(limit).skip(skip).populate({
        path: 'comments',
        populate: {
          path: 'author'
        },
        options: {
          sort: {
            createdAt: 'desc'
          }
        }
      })
    return res.json({comments: post.comments.map(function(comment){
          return comment.toJSONFor(user);
    })});
  });


router.post('/:post/comments', function(req, res, next) {

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
});

router.delete('/:post/comments/:comment', function(req, res, next) {
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
});
module.exports = router;

