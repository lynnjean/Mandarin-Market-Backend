var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
var User = mongoose.model('User')

var PostSchema = new mongoose.Schema({
    content:String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    heartCount:{type:Number, default: 0},
},{timestamps:true})

// PostSchema.plugin(autoIncrement,{
// })

PostSchema.methods.toJSONFor = function(user){
    return {
        id: this._id,
        content:this.content,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        hearted: user ? user.inhearts(this._id) : false,
        heartCount:this.heartCount,
        author: this.author.toProfileJSONFor(this.author)
    };
  };

mongoose.model('Post',PostSchema)