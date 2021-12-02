var fs = require('fs'),
    path=require('path'),
    methods = require('methods'),
    express = require('express'),
    http = require('http'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    morgan=require('morgan');

var app=express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())

app.use(require('method-override')());

mongoose.connect('mongodb://127.0.0.1:27017/test');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
    console.log('conn');
});

require('./models/User')
require('./models/Post')
require('./config/passport')

app.use(require('./routes'))

app.listen(5050,()=>{console.log('start server')});
