var http = require('http'),
socketio = require("socket.io");

const runSocketIo=function(server, mongoose){
    var io = socketio(server, {
        cors: {
          origin: "http://146.56.183.55:3030/",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
      });
    // var io = socketio(server);
    var User = mongoose.model('User')
    var Chat = mongoose.model('Chat')
    var ChatRoom = mongoose.model('ChatRoom');
    var Participant = mongoose.model('Participant');

    io.on('connection', (socket) => {

        console.log('a user connected')

        disconnect(socket)
        joinRoom(socket,io)
        leaveRoom(socket,io)
        message(socket,io,User,Chat,ChatRoom,Participant)
        readChat(socket,io,Chat,Participant,ChatRoom)
    });
}

const disconnect =function(socket){
    socket.on('disconnect',()=>{
        console.log('user disconnected');
    })
}

const joinRoom= function(socket,io){
    socket.on('joinRoom', (roomId, name) => {
        socket.join(roomId)
        io.to(roomId).emit('joinRoom', roomId, name);
    });
}

const message=function(socket, io, User, Chat, ChatRoom,Participant){
    socket.on('message',async(roomId, senduserId, message)=>{   
        const senduser=await User.findById(senduserId)
        const chat= new Chat({
            roomId:roomId,
            senduserId:senduserId,
            image:senduser.image|| 'http://146.56.183.55:3030/Ellipse.png',
            participant:senduser.accountname,
            message:message
        })
        console.log(chat)
        await chat.save()

        await ChatRoom.update({_id:chat.roomId},{lastchat:chat.message, lastReadId:chat._id})

        io.to(roomId).emit('message', senduserId, message)

        const participant=await Participant.find({roomId:chat.roomId,userId:{$ne:senduserId}},)

        await Participant.update({roomId:chat.roomId,userId:participant[0].userId},{notRead:1})
        await Participant.update({roomId:chat.roomId,userId:senduserId},{notRead:0,lastRead:chat._id.toString()})
    })
}

const readChat=function(socket,io,Chat,Participant,ChatRoom){
    socket.on('readChat',async(roomId,userId)=>{
        const chatroom= await ChatRoom.find({_id:roomId})
        await Participant.update({roomId:roomId,userId:userId},{notRead:0})

        io.to(roomId).emit('readChat',roomId, chatroom.lastReadId)
    })
}

const leaveRoom=function(socket,io){
    socket.on('leaveRoom',(roomId, name)=>{
        socket.leave(roomId)
        io.to(roomId).emit('leaveRoom',roomId, name)
    })
}

module.exports = runSocketIo;

