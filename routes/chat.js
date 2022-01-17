var mongoose = require('mongoose');
var User = mongoose.model('User');
var ChatRoom = mongoose.model('ChatRoom');
var Chat = mongoose.model('Chat');
var Participant = mongoose.model('Participant');
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.use(auth.required) 

router.param('chatroom', async function(req, res, next, chatroomId) {
    ChatRoom.findById(chatroomId).then(function(chatroom) {
        if(!chatroom) return res.status(404).json({'message':"채팅방이 존재하지 않습니다.",'status':'404'});
        req.chatroom = chatroom;
        return next();
      }).catch(()=>{return res.status(404).json({'message':"존재하지 않는 채팅방입니다.",'status':404})});
  });

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.profile=user;
        next();
    }).catch(next);
})

router.post('/:accountname/chatroom',async function(req,res){
    if(req.profile.id===req.payload.id) return res.json({'message':"자신과의 채팅은 할 수 없습니다."})
    const allchatroom=await ChatRoom.find({participant:req.profile.accountname,me:req.payload.id})
    if (allchatroom.length>=1) return res.json({'message':"이미 만들어진 채팅방 입니다."})

    const me=await User.findById(req.payload.id)
    const participants=await User.findById(req.profile.id)

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
})

router.get('/roomList', async function(req,res) {
    const rooms = await Participant.find({userId:req.payload.id},)
    return res.status(200).json({rooms:rooms.map(rooms=>rooms.toParticipantJSONFor())})
})

//채팅 내용 보낼때 사용??
router.get('/:chatroom', async function(req,res){
    const participant=req.chatroom.participant
    const me=req.payload.id

    const chatting=await Chat.find({roomId:req.chatroom._id})
    return res.status(200).json({me:me,participant:participant,chatting})
})

module.exports = router;