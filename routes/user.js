var mongoose=require('mongoose');
var express=require('express');
var passport=require('passport');
var User=mongoose.model('User');
var auth=require('./auth');
var image=require('./image.js');
var Jwt=require('jsonwebtoken');

var secret=require('../config').secret;
var jwt=require('jsonwebtoken');
var jwt=require('express-jwt');

var router=express.Router();
 
var list=(req,res,next)=>{
    User.find({}).then((user)=>{
        return res.json(user);
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
    const regex=new RegExp(/\S+@\S+\.\S+/);
    if (!req.body.user.accountname||!req.body.user.email||!req.body.user.password||!req.body.user.username) return res.status(422).json({'message':"필수 입력사항을 입력해주세요.",'status':422});
    if (regex.test(req.body.user.email)===false) return res.status(422).json({'message':'잘못된 이메일 형식입니다.','status':422})
    if (req.body.user.password.length<6) return res.status(422).json({'message':'비밀번호는 6자 이상이어야 합니다.','status':422})

    user.username=req.body.user.username;
    user.accountname = req.body.user.accountname;
    user.email=req.body.user.email;
    user.intro=req.body.user.intro;
    user.setPassword(req.body.user.password);
    //(post)local/image/uploadFile ->(get)local/filename.png
    user.image=req.body.user.image; 
    
    user.save().then(()=>{
        return res.status(200).json({'message':'회원가입 성공',user:user.toJoinJson(user)})
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
        if(typeof req.body.user.image!=='undefined'){
            user.image=req.body.user.image;
        }

        return User.findOneAndUpdate({_id:req.payload.id},user).then(function(){
            return res.json({user:user.toProfileJSONFor(user)});
        })
    }).catch(next);
}

var refreshAuth=(req,res)=>{
    if (req.headers.authorization && req.headers.refresh.split(' ')[0]==='Token'||
    req.headers.authorization && req.headers.refresh.split(' ')[0]==='Bearer'){
        var refreshToken=req.headers.authorization.split(' ')[1];
        // let refreshToken=req.body.refreshToken;

        if(!refreshToken){
            return res.status(401);
        }

        Jwt.verify(refreshToken,secret,(error,user)=>{
            if(error){
                return res.status(403);
            }
            var token=user.generateJWT();
            res.json({token});
        });
        return token;
    }return null;
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

var userdelete=(req,res)=>{
    User.findById(req.payload.id).then(function(user){
        if (!user) return res.status(401).json("존재하지 않는 유저입니다.");

        if(req.payload.id.toString() === req.user.id.toString()){
            value=user.userDelete(req.user.id)
            if(value) return res.status(200).json({'message':"삭제되었습니다.",'status':'200'})
        }
        return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요.",'status':'403'})
    })
}   

router.post('/',create);
router.post('/login',login);
router.get('/', list); // 개발용

router.use(auth.required);
router.put('/',update);
router.delete('/',userdelete); //개발용
router.get('/searchuser',searchUser);
router.post('/refresh',refreshAuth)

module.exports = router;