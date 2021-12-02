var mongoose = require('mongoose')
var Post = mongoose.model('Post')
var User = mongoose.model('User')
var express=require('express');
const auth = require('./auth');
var router=express.Router();



const create = async function createPost(req, res, next) {
    const user = await User.findById(req.payload.id)
    const post = new Post(req.body.post)
    post.author = user
    post.save()
    return res.json({post: post.toJSONFor(user)})
}

const update = async function updatePost(req, res, next){
    const user = await User.findById(req.payload.id)
}

router.get('/', async (req,res,)=>{
    const posts = await Post.find({}).sort({createdAt:'descending'}).populate('author');
    console.log(posts);
    res.status('200').json({
        status: 'ok',
        data: posts.length,
        posts,
    })
})

router.use(auth.required)
router.post('/', create);
router.put('/', update)
module.exports = router;

