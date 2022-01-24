var fs = require('fs'),
    path=require('path'),
    methods = require('methods'),
    express = require('express'),
    http = require('http'),
    https = require("https"),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    morgan=require('morgan'),
    multer = require('multer');
// var ip = require("ip");

var runSocketIo=require('./socket')

var privateKey = fs.readFileSync("/etc/letsencrypt/live/mandarin.cf/privkey.pem")
var certificate = fs.readFileSync("/etc/letsencrypt/live/mandarin.cf/cert.pem")
var ca = fs.readFileSync("/etc/letsencrypt/live/mandarin.cf/chain.pem")
const credentials = { key: privateKey, cert: certificate, ca: ca }

const app = express()

var server = https.createServer(credentials, app); 

app.set('view engine','ejs');
app.set('views','./views');

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(require('method-override')());

mongoose.connect('mongodb://127.0.0.1:27017/https');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    console.log('db connection');
});

require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Product');
require('./models/Report');
require('./models/ChatRoom');
require('./models/Chat');
require('./models/Participant');
require('./config/passport');

app.use(require('./routes'))

app.use(express.static('uploadFiles'));

// error
app.use((req,res,next)=>{
    var err=new Error('Not Found')
    err.status=404;
    return next(err);
})

app.use((err,req,res,next)=>{
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
            return res.status(422).json({'message':'이미 사용중인 계정 ID입니다.','status':422})
        }
    }

    if (err.code==='credentials_required'){   
        return res.status(401).json({'message':"토큰이 없습니다.",'status':401})
    }

    if (err.code==='invalid_token'){   
        return res.status(401).json({'message':"유효하지 않은 토큰입니다.",'status':401})
    }

    if(err.name==='TypeError'){
        return res.status(200).json({'message':"잘못된 접근입니다.",'status':200})
    }

    return next(err);
})

app.use((err,req,res,next)=>{
    res.json(err)
    return next(err);
})

runSocketIo(server)

server.listen(5000,()=>{
    var dir='./uploadFiles';
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log('start server')
});