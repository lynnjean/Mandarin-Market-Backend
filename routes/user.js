var mongoose=require('mongoose');
var express=require('express');
var passport=require('passport');
var User=mongoose.model('User');
var auth=require('./auth');
var image=require('./image.js');
var Jwt=require('jsonwebtoken');

var secret=require('../config').secret;
var jwt=require('jsonwebtoken');
const { read } = require('fs');

var router=express.Router();
 
var list=(req,res,next)=>{
    User.findById(req.payload.id).then((user)=>{
        if (!user){
            return res.status(401).json("존재하지 않는 유저입니다.")
        }
        return res.json({user:user.toAuthJson(user)});
    }).catch(next);
};

var login=(req,res,next)=>{
    if (!req.body.user.email&&!req.body.user.password) return res.status(422).json("이메일 또는 비밀번호를 입력해주세요.");
    if (!req.body.user.email) return res.status(422).json("이메일을 입력해주세요.");
    if (!req.body.user.password) return res.status(422).json("패스워드를 입력해주세요.");

    passport.authenticate('local',{session:false}, (err,user,info)=>{
        if (err) return next(err);
        if (user){
            var token=user.generateJWT();
            var refreshToken=user.refreshJWT();
            return res.json({user:user.toAuthJson()})
        }else {
            return res.status(422).json("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    })(req,res,next);
};
  
var create=function(req,res,next){
    var user=new User();
    if (!req.body.user.accountname||!req.body.user.email||!req.body.user.password||!req.body.user.username) return res.status(422).json("필수 입력사항을 입력해주세요.");
    if (req.body.user.password.length<6) return res.status(422).res.json('비밀번호는 6자 이상이어야 합니다.')

    user.username=req.body.user.username;
    user.accountname = req.body.user.accountname;
    user.email=req.body.user.email;
    user.intro=req.body.user.intro;
    user.setPassword(req.body.user.password);
    //(post)local/image/uploadFile ->(get)local/filename.png
    user.image=req.body.user.image; 
    
    user.save().then(()=>{
        return res.status(200).json('회원가입 성공')
    }).catch(next);
};

var update=(req,res,next)=>{
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401).json("존재하지 않는 유저입니다.");

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
    }).catch(next);
}

var refreshAuth=(req,res)=>{
    let refreshToken=req.body.refreshToken;ㅇ

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

router.post('/',create);
router.post('/login',login);

router.use(auth.required);
router.get('/', list); 
router.put('/',update);
router.get('/searchuser',searchUser);

module.exports = router;