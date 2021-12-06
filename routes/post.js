var mongoose = require('mongoose')
var Post = mongoose.model('Post')
var User = mongoose.model('User')
var Comment = mongoose.model('Comment');
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.param('post', function(req, res, next, postId) {
    console.log("middle", postId);
    Post.findOne({ _id: postId})
      .populate('author')
      .then(function (post) {
        if (!post) { return res.sendStatus(404); }
  
        req.post = post;
  
        return next();
      }).catch(next);
  });
  
router.get('/:post', auth.optional, function(req, res, next) {
    console.log("ssssss");
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.post.populate('author')
    ]).then(function(results){
        console.log("1");
        var user = results[0];
        return res.json({post: req.post.toJSONFor(user)});
    }).catch(next);
});

const create = async function createPost(req, res, next) {
    const user = await User.findById(req.payload.id)
    const post = new Post(req.body.post)
    post.author = user
    await post.save()
    return res.json({post: post.toJSONFor(user)})
}

const update = async function updatePost(req, res, next){
    if(req.payload.id.toString() === req.post.author._id.toString()){
        await Post.findByIdAndUpdate(req.post._id,req.body.post)
        const user = await User.findById(req.payload.id)
        const post = await Post.findById(req.post.id).populate('author')
        return res.json({post: post.toJSONFor(user)})
    }
    return res.status(403).send("잘못된 요청입니다. 로그인 정보를 확인하세요")
}
router.use(auth.required)

router.get('/', async (req,res,)=>{
    const posts = await Post.find({}).sort({createdAt:'descending'}).populate('author');
    console.log(posts);
    res.status('200').json({
        status: 'ok',
        data: posts.length,
        posts,
    })
})

router.post('/', create);
router.put('/:post', update);



router.param('comment', function(req, res, next, id) {
    Comment.findById(id).then(function(comment){
      if(!comment) { return res.sendStatus(404); }
  
      req.comment = comment;
  
      return next();
    }).catch(next);
  });

router.get('/:post/comments', function(req, res, next){
    console.log(req.post);
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
  });


router.post('/:post/comments', function(req, res, next) {
    console.log("test")
    User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    var comment = new Comment(req.body.comment);
    comment.post = req.post;
    comment.author = user;

    return comment.save().then(function(){
    req.post.comments.push(comment);
    console.log("?");

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

