var express=require('express');

var router=express.Router();

router.use('/user',require('./user'));
router.use('/post' ,require('./post'));
router.use('/profile',require('./profile'));
router.use('/product',require('./product'));
router.use('/image',require('./image'));

module.exports=router;