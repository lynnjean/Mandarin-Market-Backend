var fs = require('fs'),
    path=require('path'),
    methods = require('methods'),
    express = require('express'),
    http = require('http'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    morgan=require('morgan'),
    multer = require('multer');
const AutoIncrementFactory = require('mongoose-sequence');

var runSocketIo=require('./socket')

var app=express();
var server = http.createServer(app); //서버 생성 메소드(createServer)를 제공하며 파라미터로 express를 넘겨줌
//server 변수에 담은 이유? ttp.createServer() 메소드는 서버를 생성하는 작업을 하고 난 후 생성한 서버 객체를 리턴해줍니다. 생성된 서버를 제어하기 위해 server 변수에 담는 것입니다.

app.set('view engine','ejs');
app.set('views','./views');

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(require('method-override')());

mongoose.connect('mongodb://127.0.0.1:27017/user');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    console.log('db connection');
});
const AutoIncrement = AutoIncrementFactory(db);

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

runSocketIo(server, mongoose)

app.get('/chatting', function(req,res) {
    res.render('chat')
})

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
    console.log(err.name)

    return next(err);
})

app.use((err,req,res,next)=>{
    res.json(err)
    return next(err);
})

server.listen(5050,()=>{
    var dir='./uploadFiles';
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log('start server')
});
