// var mongoose = require('mongoose');
var http = require('http'),
socketio = require("socket.io");
// var User = mongoose.model('User');
// var Chat = mongoose.model('Chat');
// var ChatRoom = mongoose.model('ChatRoom');
// var Participant = mongoose.model('Participant');
// const auth = require('./routes/auth');

// app.use(auth.required);

const runSocketIo=function(server){
    const io=socketio(server)
    io.on('connection',async (socket)=>{
        console.log('a user connected')

        disconnect(socket)
        joinRoom(socket,roomlist)
        leaveRoom(socket)
        message(socket,io)
        // readChat(socket,io)
    })
}

const disconnect =function(socket){
    socket.on('disconnect',()=>{
        console.log('user disconnected');
    })
}

const joinRoom= function(socket){
    socket.on('joinRoom',(roomId, name)=>{
        socket.join(roomId,()=>{
            io.to(roomId).emit('joinRoom', roomId, name)
        })
    })
}

const leaveRoom=function(socket){
    socket.on('leaveRoom',(roomId, name)=>{
        socket.leave(roomId)
        logger.info(`${roomId}에 떠남`);
        io.to(roomId).emit('leaveRoom',roomId, name)
    })
}

const message=function(socket, io){
    socket.on('message',async(messageInfo)=>{
        const {roomId,senduserId, message, notRead} = messageInfo
        const savedMessage= new Chat(messageInfo)
        await ChatRoom.findByUpdate({id:savedMessage.roomId},{lastchat:savedMessage.message})
        
        const room=messageInfo.roomId.toString();
        io.to(room).emit('message',savedMessage.toChatJSONFor(savedMessage))
    })
}

// const readChat=function(socket,io){
//     socket.on('readChat',async(req)=>{
//         const {userId, roomId, Participant,lastRead}=req
//         await Chat.findByIdAndUpdate(roomId,{notRead:})

//         await Participant.findByIdAndUpdate({userId:savedMessage.userId,roomId:savedMessage.roomId},{notRead:0,lastRead:savedMessage[1]})

//         const room=messageInfo.roomId.toString();
//         io.to(room).emit('readChat',savedMessage.toChatJSONFor(savedMessage))
//     })
// }

module.exports = runSocketIo;

