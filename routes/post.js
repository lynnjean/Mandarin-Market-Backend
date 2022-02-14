const express=require('express');
const auth = require('./auth');
const postController=require('../controllers/post')
const heartController=require('../controllers/heart')
const commentController=require('../controllers/comment')

const mongoose = require('mongoose'),
Post = mongoose.model('Post'),
User = mongoose.model('User'),
Comment = mongoose.model('Comment'),
Report=mongoose.model('Report');

const router=express.Router();

router.param('post', async function(req, res, next, postId) {
  Post.findById(postId).populate('author').then(function(post) {
      if(!post) return res.status(404).json({'message':"존재하지 않는 게시글입니다.",'status':404})
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

router.param('accountname',(req,res,next,accountname)=>{
  User.findOne({accountname:accountname}).then((user)=>{
      if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
      req.user=user;
      next();
  }).catch(next);
})

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    req.comment = comment;
    return next();
  }).catch(()=>{return res.status(404).json({'message':'댓글이 존재하지 않습니다.','status':'404'})});
});

// 토큰 검증
router.use(auth.required) 
// 게시글 작성
router.post('/', postController.createPost);
// 게시글 목록
router.get('/', postController.getPosts); 
// 팔로우한 게시글 목록
router.get('/feed',postController.getFeed);
// 게시글 상세
router.get('/:post', postController.getPostById);
// 나의 게시글
router.get('/:accountname/userpost',postController.userPost)
// 게시글 수정
router.put('/:post', postController.updatePost); 
// 게시글 삭제
router.delete('/:post', postController.removePost); 
// 게시글 신고
router.post('/:post/report',postController.postReport);

// 좋아요
router.post('/:post/heart',heartController.hearton);
// 좋아요 취소
router.delete('/:post/unheart',heartController.unheart);

// 댓글 목록
router.get('/:post/comments', commentController.commentlist);
// 댓글 작성
router.post('/:post/comments', commentController.comment);
// 댓글 삭제
router.delete('/:post/comments/:comment', commentController.uncomment); 
// 댓글 신고
router.post('/:post/comments/:comment/report', commentController.commentReport);

module.exports = router;