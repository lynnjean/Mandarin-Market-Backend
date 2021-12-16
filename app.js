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

var app=express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(require('method-override')());
// app.use(errorhandler());

mongoose.connect('mongodb://localhost/user');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    console.log('db connection');
});

require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Product');
require('./models/Report');
require('./config/passport');

app.use(require('./routes'))

app.use(express.static('uploadFiles'));

app.listen(5050,()=>{
    var dir='./uploadFiles';
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    
    console.log('start server')
});





