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

var upload=multer({storage:storage,limits:{fileSize: 10 * 1024 * 1024}}) //MB*110*110

router.post('/uploadfile',upload.single('image'),function(req,res){
    ext=['jpg','gif','png','jpeg','bmp','tif'];

    // if (req.file.mimetype==="image/png")
    //     return res.render('confirmation',{file:req.file,files:null})
    // else return res.send('이미지 파일만 업로드')
    return res.send(req.file)
    // };
})

router.post('/uploadFiles',upload.array('image'),function(req,res){
    // 확장자 ["image/png","image/gif","image/jpeg"]
    // if (req.file.mimetype==="image/png")
    //     res.render('confirmation',{file:null,files:req.files})
    // else return res.send('이미지 파일만 업로드') 

    console.log(req.files)
    return res.send(req.files)
})

module.exports=router;