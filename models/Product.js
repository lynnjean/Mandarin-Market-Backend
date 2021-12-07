var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
// var User = mongoose.model('User')

var ProductSchema = new mongoose.Schema({
    itemName:String,
    price:Number,
    link:String,
    itemImage: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{timestamps:true})

ProductSchema.methods.toProductJSONFor = function(user){
    return {
        id:this._id,
        itemName:this.itemName,
        price: this.price,
        link:this.link,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: this.author
    };
  };

mongoose.model('Product',ProductSchema)
