var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');
var User = mongoose.model('User')

var ChatRoomSchema = new mongoose.Schema({
    lastmessage:String
},{timestamps:true})

ChatRoomSchema.methods.toChatJSONFor= function(user){
    return {
        _id: this._id,
        lastmessage:this.lastmessage,
        updatedAt: this.updatedAt,
    }
}

mongoose.model('ChatRoom',ChatRoomSchema);