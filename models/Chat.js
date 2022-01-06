var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ChatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
    senduserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    message:String,
    notRead:String
},{timestamps:true})

ChatSchema.methods.toChatJSONFor= function(){
    return {
        _id: this._id, //채팅 개별 id
        roomId:this.roomId,
        senduserId: this.senduserId,
        message:this.message,
        notRead:this.notRead,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('Chat',ChatSchema);