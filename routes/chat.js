const express=require('express');
const auth = require('./auth');
const chatController=require('../controllers/chat')

const mongoose = require('mongoose'),
User = mongoose.model('User'),
ChatRoom = mongoose.model('ChatRoom'),
Chat = mongoose.model('Chat'),
Participant = mongoose.model('Participant');

const router=express.Router();

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

// 토큰 검증
router.use(auth.required) 
// 채팅방 입장
router.post('/:accountname/chatroom',chatController.chatroomIn)
// 채팅방 목록
router.get('/roomList', chatController.roomlist)
//채팅 내용 보낼때 사용
router.get('/:chatroom', chatController.chatText)

module.exports = router;