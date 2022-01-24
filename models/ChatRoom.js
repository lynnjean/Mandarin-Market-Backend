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

ChatRoomSchema.methods.toChatJSONFor= function(){
    return {
        _id: this._id,
        lastchat:this.lastchat,
        lastReadId:this.lastReadId,
        myId:this.myId,
        me:this.me,
        image:this.image || 'https://api.mandarin.cf/Ellipse.png',
        participant:this.participant,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('ChatRoom',ChatRoomSchema);
