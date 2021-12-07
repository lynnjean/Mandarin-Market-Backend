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

mongoose.connect('mongodb://localhost/user');
require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Product')
require('./config/passport');

app.use(require('./routes'))

app.listen(5050,()=>{console.log('start server')});
