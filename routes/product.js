const express=require('express');
const auth = require('./auth');
const productController=require('../controllers/product')

const mongoose = require('mongoose'),
Product = mongoose.model('Product'),
User = mongoose.model('User');

const router=express.Router();

router.param('product',function(req,res,next,itemid){
    Product.findById(itemid).populate('author').then(function(product){
        req.product=product;
        return next();
    }).catch(()=>{return res.status(404).json({'message':'등록된 상품이 없습니다.','status':'404'})});
})

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.user=user;
        next();
    }).catch(next);
  })

// 토큰 검증
router.use(auth.required);
// 상품 목록
router.get('/',productController.productlist)
// 나의 상품 목록
router.get('/:accountname', productController.userproduct);
// 상품 상세 정보
router.get('/detail/:product/', productController.productInfo);
// 상품 등록
router.post('/',productController.create); 
// 상품 정보 수정
router.put('/:product',productController.productUpdate); 
// 상품 삭제
router.delete('/:product',productController.productremove); 

module.exports = router;