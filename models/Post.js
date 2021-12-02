var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
var User = mongoose.model('User')

var PostSchema = new mongoose.Schema({
    title:String,
    contentId:Number,
    content:String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // comments:{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    heartCount:{type:Number, default: 0},
},{timestamps:true})

// PostSchema.plugin(autoIncrement,{
// })

PostSchema.methods.toJSONFor = function(user){
    return {
        contentId:this.contentId,
        title: this.title,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        // favorited: user ? user.isFavorite(this._id) : false,
        favoritesCount: this.favoritesCount,
        heartCount:this.heartCount,
        author: this.author
    };
  };

mongoose.model('Post',PostSchema)