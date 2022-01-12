var http = require('http'),
socketio = require("socket.io");

const runSocketIo=function(server, mongoose){
    var io = socketio(server, {
        cors: {
          origin: "http://localhost:3030/",
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
        readChat(socket,io,Participant,ChatRoom)
    });
}

const disconnect =function(socket){
    socket.on('disconnect',()=>{
        console.log('user disconnected');
    })
}

const joinRoom= function(socket,io){
    socket.on('joinRoom', (roomId, name) => {
        if(!roomId||!name) return console.log('채팅방 이름 또는 유저 이름을 불러오세요.')
        socket.join(roomId)
        io.to(roomId).emit('joinRoom', roomId, name);
    });
}

const message=function(socket, io, User, Chat, ChatRoom,Participant){
    socket.on('message',async(roomId, senduserId, message)=>{   
        if(!roomId||!senduserId||!message) return console.log('채팅방 이름, 유저 이름, 메시지를 불러오세요.')

        const senduser=await User.findById(senduserId)
        const chat= new Chat({
            roomId:roomId,
            senduserId:senduserId,
            image:senduser.image|| 'http://localhost:3030/Ellipse.png',
            participant:senduser.accountname,
            message:message
        })

        await chat.save()

        await ChatRoom.update({_id:chat.roomId},{lastchat:chat.message, lastReadId:chat._id})

        io.to(roomId).emit('message', senduserId, message)

        const participant=await Participant.find({roomId:chat.roomId,userId:{$ne:senduserId}},)

        await Participant.update({roomId:chat.roomId,userId:participant[0].userId},{notRead:1})
        await Participant.update({roomId:chat.roomId,userId:senduserId},{notRead:0,lastRead:chat._id.toString()})
    })
}

const readChat=function(socket,io,Participant,ChatRoom){
    socket.on('readChat',async(roomId,userId)=>{
        if(!roomId||!userId) return console.log('채팅방 이름, 유저 이름을 불러오세요.')

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

