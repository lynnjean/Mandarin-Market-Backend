var mongoose=require('mongoose');

var autoIncrement = require('mongoose-sequence');

var ParticipantSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target_username:String,
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
    participant: String,
    image:String,
    roomname: String,
    notRead:Number,
    lastRead:String
},{timestamps:true})

ParticipantSchema.methods.toParticipantJSONFor= function(){
    return {
        userId:this.userId,
        target_username:this.target_username,
        participant:this.participant,
        image:this.image || 'http://146.56.183.55:5050/Ellipse.png',
        roomId: this.roomId,
        roomname:this.roomname,
        notRead:this.notRead,
        lastRead:this.lastRead,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('Participant',ParticipantSchema);
