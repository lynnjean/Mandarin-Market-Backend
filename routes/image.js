var express=require('express'),
router=express.Router(),
multer=require('multer'),
path = require('path');

var storage = multer.diskStorage({
    destination : function(req, file, collback){    
        collback(null, 'uploadFiles/');
    },
    filename : function(req, file, collback){
        var mimeType;
        collback(null, new Date().valueOf() + path.extname(file.originalname));
    }
});

var upload=multer({
    storage:storage,
    limits:{
        fileSize: 10 * 1024 * 1024,
        //fieldNameSize:필드명 사이즈 최대값
        //fields:필드의 최대 개수
        //fileSize:최대 파일 사이즈(bytes)
        files:3 //파일 필드 최대 개수
    },fileFilter:function(req,file,callback){
        ext=['.jpg','.gif','.png','.jpeg','.bmp','.tif'];

        var index = ext.indexOf(path.extname(file.originalname));
        if (index !== -1)
            callback(null,true)
        else return callback({message:"이미지 파일만 업로드가 가능합니다."},false)
    }   
}) //MB*110*110

router.post('/uploadfile',upload.single('image'),function(req,res){
    return res.send(req.file)
})

router.post('/uploadFiles',upload.array('image'),function(req,res){
    return res.send(req.files)
})

module.exports=router;