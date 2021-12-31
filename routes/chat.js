// var express=require('express'),
//  fs = require('fs'),
//  socketio = require("socket.io"),
//  server=require('../app');

// var io=socketio(server)
// var router=express.Router();

// var chat=(req,res,next)=>{
//     fs.readFile('HTMLPage.html',(error,data)=>{
//         res.writeHead(200, {'Content-Type':'text/html'})
//         res.end(data)
//     })
// }
// function name(io) {
    
// }
// io.socket.on('connection',(socket)=>{
//     var roomName=null;
//     socket.on('message',(data)=>{
//         roomName=data;
//         socket.join(data);
//     })

//     socket.on('message',(data)=>{
//         io.socket.in(roomName).emit('message',data)
//         console.log(data);
//     })

//     socket.on('image',(data)=>{
//         io.socket.in(roomName).emit('image',data)
//         console.log(data);
//     })
// })

// module.exports = router;