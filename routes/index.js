var express=require('express');

var router=express.Router();

router.use('/',require('./users'));
router.use('/post' ,require('./post'));
router.use('/profiles',require('./profiles'));
router.use('/product',require('./product'));

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
