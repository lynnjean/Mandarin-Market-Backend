var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ChatRoomSchema = new mongoose.Schema({
    lastchat:String,
    lastReadId:String,
    participant:String
},{timestamps:true})

ChatRoomSchema.methods.toChatJSONFor= function(){
    return {
        _id: this._id,
        lastchat:this.lastchat,
        lastReadId:this.lastReadId,
        participant:this.participant,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('ChatRoom',ChatRoomSchema);