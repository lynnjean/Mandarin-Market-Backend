var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ChatRoomSchema = new mongoose.Schema({
    lastchat:String,
    lastReadId:String,
    myId:String,
    me:String,
    participant:String,
    image:String
},{timestamps:true})

ChatRoomSchema.methods.toChatRoomJSONFor= function(){
    return {
        _id: this._id,
        lastchat:this.lastchat,
        lastReadId:this.lastReadId,
        me:this.me,
        myId:this.myId,
        participant:this.participant,
        image:this.image || 'http://146.56.183.55:3030/Ellipse.png',
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('ChatRoom',ChatRoomSchema);