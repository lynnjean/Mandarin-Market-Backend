var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ParticipantSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
    participant: String,
    roomname: String,
    notRead:Number,
    lastRead:String
},{timestamps:true})

ParticipantSchema.methods.toParticipantJSONFor= function(){
    return {
        userId:this.userId,
        participant:this.participant,
        roomId: this.roomId,
        roomname:this.roomname,
        notRead:this.notRead,
        lastRead:this.lastRead,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('Participant',ParticipantSchema);