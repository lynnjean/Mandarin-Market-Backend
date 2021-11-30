var mongoose=require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var User = mongoose.model('user')

var PostSchema = new mongoose.Schema({
    title:String,
    contentId:Number,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // comments:{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    favoritesCount: {type: Number, default: 0},
    heartCount:{type:Number, default: 0},
},{timestamps:true})

PostSchema.plugin(autoIncrement,{
    model:'Post',
    field:'contentId',
    startAt: 0,
    increment: 1
})



mongoose.model('Post',PostSchema)