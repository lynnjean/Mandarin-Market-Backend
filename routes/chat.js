var mongoose = require('mongoose');
var User = mongoose.model('User');
var ChatRoom = mongoose.model('ChatRoom');
var Chat = mongoose.model('Chat');
var Participant = mongoose.model('Participant');
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.get('/chatting',async function(req,res){
    res.render('chat');
})

router.use(auth.required) 

router.param('chatroom', async function(req, res, next, chatroomId) {
    ChatRoom.findById(chatroomId).then(function(chatroom) {
        req.chatroom = chatroom;

        return next();
      }).catch(()=>{return res.status(404).json({'message':"존재하지 않는 채팅방입니다.",'status':404})});
  });

router.param('user', async function(req, res, next, userId) {
    const user = await User.findById(userId)
    if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
    req.user = user
    return next()
})

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.profile=user;
        next();
    }).catch(next);
})

router.post('/:accountname/chatroom',async function(req,res){
    const user=await User.findById(req.payload.id)
    if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'})
    var chatroom = new ChatRoom(req.body.chatroom)
    var participant1=new Participant({
        userId:req.payload.id,
        roomId:chatroom._id,
        roomname:chatroom.roomname,
        notRead:0,
        lastRead:0
    })

    var participant2=new Participant({
        userId:req.profile.id,
        roomId:chatroom._id,
        roomname:chatroom.roomname,
        notRead:0,
        lastRead:0
    })

    await chatroom.save()
    await participant1.save()
    await participant2.save()
    return res.status(200).json({chatroom:chatroom.toChatJSONFor()})
})

//채팅 목록
router.get('/roomList', async function(req,res) {
    const user = await User.findById(req.payload.id)
    const rooms = await Participant.find({userId:user._id},)
    return res.status(200).json({rooms:rooms.map(rooms=>rooms.toParticipantJSONFor())})
})

//채팅 내용 보낼때 사용
router.get('/:chatroom', async function(req,res){
    const chatting=await Chat.find({roomId:req.chatroom._id},)
    return res.status(200).json(chatting)
})

module.exports = router;