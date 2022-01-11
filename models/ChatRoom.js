var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ChatRoomSchema = new mongoose.Schema({
    lastchat:String,
    lastReadId:String,
    participant:String,
    image:String
},{timestamps:true})

ChatRoomSchema.methods.toChatJSONFor= function(){
    return {
        _id: this._id,
        lastchat:this.lastchat,
        lastReadId:this.lastReadId,
        image:this.image || 'http://146.56.183.55:3030/Ellipse.png',
        participant:this.participant,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('ChatRoom',ChatRoomSchema);