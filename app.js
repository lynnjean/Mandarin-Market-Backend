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
    multer = require('multer'),
    socketio = require("socket.io"),    
    session = require('express-session');

// var MongoStore = require('connect-mongo')(session);

var app=express();
var server = http.createServer(app); //서버 생성 메소드(createServer)를 제공하며 파라미터로 express를 넘겨줌
//server 변수에 담은 이유? ttp.createServer() 메소드는 서버를 생성하는 작업을 하고 난 후 생성한 서버 객체를 리턴해줍니다. 생성된 서버를 제어하기 위해 server 변수에 담는 것입니다.
var io = socketio(server);

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(require('method-override')());

mongoose.connect('mongodb://127.0.0.1:27017/user');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    console.log('db connection');
});

// var mongoStore=new MongoStore({
//     db:db.connection.db
// })

// app.use(session({
//     saveUninitialized:true,
//     resave:true,
//     secret:config.sessionSecret,
//     store:mongoStore
// }))

require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Product');
require('./models/Report');
require('./config/passport');

io.sockets.on("connection", (socket) => {
    socket.on("message", (data) => {
        console.log(data)
        io.sockets.emit("message", data); //메시지 저장
    });
});

app.use(require('./routes'))

app.use(express.static('uploadFiles'));

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
