var mongoose=require('mongoose');
const  AutoIncrement  =  require ( 'mongoose-sequence' ) ( mongoose ) ;

var ChatSchema = new mongoose.Schema({
    _id:Number,
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
    senduserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    participant:String,
    image:String,
    message:String,
    notRead:String
},{_id:false,timestamps:true})

ChatSchema.plugin(AutoIncrement);

ChatSchema.methods.toChatJSONFor= function(){
    return {
        _id: this._id, //채팅 개별 id
        roomId:this.roomId,
        participant:this.participant,
        image:this.image || 'https://api.mandarin.cf/Ellipse.png',
        senduserId: this.senduserId,
        message:this.message,
        notRead:this.notRead,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('Chat',ChatSchema);
