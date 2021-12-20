var express=require('express');
const { transformAuthInfo } = require('passport');

var router=express.Router();

router.use('/user',require('./user'));
router.use('/post' ,require('./post'));
router.use('/profile',require('./profile'));
router.use('/product',require('./product'));
router.use('/image',require('./image'));

router.use((req,res,next)=>{
    var err=new Error('Not Found')
    err.status=404;
    return next(err);
})

router.use((err,req,res,next)=>{
    if(err.name==='ValidationError'){
        if(err.errors.email){ 
            if(err.errors.email.kind==='regexp'){
                err.errors.email.message="잘못된 이메일 형식입니다."
            }
            else err.errors.email.message="이미 가입된 이메일 주소 입니다."
            return res.status(422).json({'message':err.errors.email.message,'status':422})
        }

        if(err.errors.accountname){
            if(err.errors.accountname.kind==='regexp'){
                err.errors.accountname.message="영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다."
            }
            else err.errors.accountname.message="이미 사용중인 계정 ID입니다."
            return res.status(422).json({'message':err.errors.accountname.message,'status':422})
        }

        if(err.errors.content){
            err.errors.content.message='댓글을 입력해주세요.'
            return res.status(422).json({'message':err.errors.content.message,'status':422})
        }
    }

    if (err.name==='MongoServerError'){
        if(err.codeName==='DuplicateKey'){
            return res.status(422).json({'message':'이미 사용중인 ID입니다.','status':422})
        }
    }
    // if (err.name==='db connection'){
    //     if (error.name==401)
    //     return res.status(422).json({'message':'비밀번호는 6자 이상이어야 합니다.','status':422})
    // }
    return next(err);
})

router.use((err,req,res,next)=>{
    res.status(err.status||500).json(err)
    return next(err);
})

module.exports=router;