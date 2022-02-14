const mongoose = require('mongoose'),
User = mongoose.model('User'),
ChatRoom = mongoose.model('ChatRoom'),
Chat = mongoose.model('Chat'),
Participant = mongoose.model('Participant');

const chat={
    chatroomIn:async function(req,res){
        if(req.profile.id===req.payload.id) return res.json({'message':"자신과의 채팅은 할 수 없습니다."})
    
        const me=await User.findById(req.payload.id)
        const participants=await User.findById(req.profile.id)
    
        const allchatroom1=await ChatRoom.find({participant:participants.accountname,me:me.accountname})
        const allchatroom2=await ChatRoom.find({participant:me.accountname,me:participants.accountname})
    
        if (allchatroom1.length>=1||allchatroom2.length>=1){
            if(allchatroom1.length>=1) return res.json({'message':"이미 만들어진 채팅방 입니다.",roomId:allchatroom1.map(allchatroom1=>allchatroom1._id)})
            if(allchatroom2.length>=1) return res.json({'message':"이미 만들어진 채팅방 입니다.",roomId:allchatroom2.map(allchatroom2=>allchatroom2._id)})
        } 
    
        var chatroom = new ChatRoom(req.body.chatroom)
        chatroom.participant=participants.accountname
        chatroom.me=me.accountname
        chatroom.myId=me._id
        chatroom.image=participants.image; 
    
        await chatroom.save()
    
        var participant1=new Participant({
            userId:req.payload.id,
            target_username:participants.username,
            roomId:chatroom._id,
            participant:me.accountname,
            image:participants.image,
            roomname:chatroom.roomname,
            notRead:0,
            lastRead:0
        })
    
        var participant2=new Participant({
            userId:req.profile.id,
            roomId:chatroom._id,
            target_username:me.username,
            participant:participants.accountname,
            image:me.image,
            roomname:chatroom.roomname,
            notRead:0,
            lastRead:0
        })
    
        await participant1.save()
        await participant2.save()
        return res.status(200).json({chatroom:chatroom.toChatJSONFor()})
    },
    roomlist:async function(req,res) {
        const rooms = await Participant.find({userId:req.payload.id},)
        return res.status(200).json({rooms:rooms.map(rooms=>rooms.toParticipantJSONFor())})
    },
    chatText:async function(req,res){
        const participant=req.chatroom.participant
        const me=await User.findById(req.payload.id)
        const chatting=await Chat.find({roomId:req.chatroom._id})
        let target
        if (req.chatroom.participant===me.accountname){
            target=await User.find({accountname:req.chatroom.me})
            return res.status(200).json({me:me._id,accountname:me.accountname,target_username:target.map(target=>target.username),participant:participant,chatting})
        }
        else{
            target=await User.find({accountname:req.chatroom.participant})
            return res.status(200).json({me:me._id,accountname:me.accountname,target_username:target.map(target=>target.username),participant:participant,chatting})
        }
    }
}

module.exports = chat;