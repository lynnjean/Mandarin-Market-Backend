var router=require('express').Router();
var mongoose=require('mongoose');
var User=mongoose.model('User');
var auth=require('./auth');

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404);
        req.profile=user;
        next();
    }).catch(next)
})

router.get('/:accountname',auth.optional,(req,res,next)=>{
    console.log(req.payload)

    if(req.payload){
        User.findById(req.payload.id).then((user)=>{
            if(!user){
                return res.json({profile:req.profile.toProfileJSONFor(false)});
            } return res.json({profile:req.profile.toProfileJSONFor(user)})
        });
    }else{
        return res.json({profile:req.profile.toProfileJSONFor(false)})
    }
})

module.exports=router;