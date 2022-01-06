var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
var User = mongoose.model('User')

var ProductSchema = new mongoose.Schema({
    itemName:{type:String,required:[true, "필수 입력 사항입니다."]},
    price:{type:Number,required:[true, "필수 입력 사항입니다."]},
    link:{type:String,required:[true, "필수 입력 사항입니다."]},
    //(post)local/image/uploadFiles ->(get)local/filename.png
    itemImage: {type:String,required:[true, "필수 입력 사항입니다."]},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{timestamps:true})

ProductSchema.methods.toProductJSONFor = function(user){
    return {
        id:this._id,
        itemName:this.itemName,
        price: this.price,
        link:this.link,
        itemImage:this.itemImage,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: this.author.toProfileJSONFor(this.author)
    };
  };

mongoose.model('Product',ProductSchema)