var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
var User = mongoose.model('User')

var PostSchema = new mongoose.Schema({
    content:String,
    //(post)local/image/uploadFiles ->(get)local/filename.png
    image:String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    heartCount:{type:Number, default: 0},
},{timestamps:true})

PostSchema.methods.updateHeartCount = function() {
    var post=this;
    return User.count({hearts:{$in:[post._id]}}).then(function(count){
        post.heartCount=count;
        return post.updateOne({heartCount:count},);
    })
}

PostSchema.methods.toJSONFor = function(user){
    return {
        id:this._id,
        content:this.content,
        image:this.image,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        hearted: user ? user.ishearts(this._id) : false,
        heartCount:this.heartCount,
        author: this.author.toProfileJSONFor(this.author)
    };
  };

mongoose.model('Post',PostSchema)