var mongoose=require('mongoose');
var express=require('express');
var passport=require('passport');
var User=mongoose.model('User');
var auth=require('./auth');
var image=require('./image.js');
var Jwt=require('jsonwebtoken');

var secret=require('../config').secret;
var jwt=require('jsonwebtoken');

var router=express.Router();
 
var list=(req,res,next)=>{
    User.findById(req.payload.id).then((user)=>{
        if (!user){
            return res.status(401);
        }
        // return res.json({user:user.toAuthJSON()});
        return res.json(user);
    }).catch(next);
};

var login=(req,res,next)=>{
    if (!req.body.user.email) return res.status(422).json({errors:{email:"can't be blank"}});

    if (!req.body.user.password) return res.status(422).json({errors:{password:"can't be blank"}});

    passport.authenticate('local',{session:false}, (err,user,info)=>{
        if (err) return next(err);
        if (user){
            var token=user.generateJWT();
            var refreshToken=user.refreshJWT();

            return res.json({
                id:user.id,
                username:user.username,
                email:user.email,
                accountname:user.accountname,
                token:token,
                refreshToken:refreshToken
            });
        }else {
            return res.status(422).json(info);
        }
    })(req,res,next);
};

  
var create=(req,res,next)=>{
    var user=new User();
    user.username=req.body.user.username;
    user.accountname = req.body.user.accountname;
    user.email=req.body.user.email;
    user.intro=req.body.user.intro;
    user.setPassword(req.body.user.password);
    //(post)local/image/uploadFile ->(get)local/filename.png
    user.image=req.body.user.image; 
    
    user.save().then(()=>{
        return res.json(user)
        // return res.json({user:req.user.toAuthJSON()});
    }).catch(next);
};

var update=(req,res,next)=>{
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401);

        if(typeof req.body.user.username!=='undefined'){
            user.username=req.body.user.username;
        }
        if(typeof req.body.user.accountname!=='undefined'){
            user.accountname=req.body.user.accountname;
        }
        if(typeof req.body.user.intro!=='undefined'){
            user.intro=req.body.user.intro;
        }

        return User.findOneAndUpdate({_id:req.payload.id},user).then(function(){
            return res.json({user:user.toProfileJSONFor(user)});
        })
    })
}

var refreshAuth=(req,res)=>{
    let refreshToken=req.body.refreshToken;

    if(!refreshToken){
        console.log(error)
        return res.status(401);
    }

    Jwt.verify(refreshToken,secret,(error,user)=>{
        if(error){
            console.log(error);
            return res.status(403);
        }

        var token=new User().generateJWT();
        res.json({token});

    });
    return token;
}

var searchUser = (req, res)=>{
    var keyword = req.query.keyword
    var options = [{username: new RegExp(keyword)}, {accountname: new RegExp(keyword)}]
    User.find({$or:options}).then(
        (result)=>{
            res.json(result.map((user)=>{return user.toProfileJSONFor()}))
        }
    )

}
router.post('/',create); //0
router.post('/login',login); //0

router.use(auth.required);
router.get('/', list); //0
router.put('/',update); //0
router.post('/refresh',refreshAuth);
router.get('/searchuser',searchUser);//0

module.exports = router;
