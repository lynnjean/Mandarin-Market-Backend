const express = require('express');
const auth=require('./auth');
const accountController=require('../controllers/account')
const followController=require('../controllers/follow')

const router=express.Router();

const mongoose=require('mongoose'),
User=mongoose.model('User');

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.profile=user;
        next();
    }).catch(next);
})

//토큰 검증
router.use(auth.required)  
// 프로필
router.get('/:accountname',auth.optional,accountController.account);
// 팔로우
router.post('/:accountname/follow',followController.follows);
// 팔로우 취소
router.delete('/:accountname/unfollow', followController.unfollow);
// 팔로잉 목록
router.get('/:accountname/following',followController.followinglist);
// 팔로우 목록
router.get('/:accountname/follower',followController.followerlist);

module.exports=router;
