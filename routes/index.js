var express=require('express');

var router=express.Router();

router.use('/user',require('./user'));
router.use('/post' ,require('./post'));
router.use('/profile',require('./profile'));
router.use('/product',require('./product'));
router.use('/image',require('./image'));
// router.use('/report',require('./report'));


router.use((err,req,res,next)=>{
    if(err.name==='ValidationError'){
        return res.status(422).json({
            errors:Object.keys(err.errors).reduce((errors,key)=>{
                errors[key]==err.errors[key].message;
                return errors;
            }, {})
        })
    }
    return next(err);
})

module.exports=router;
