var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.use(auth.required);

router.param('product',function(req,res,next,itemid){
    Product.findById(itemid).populate('author').then(function(product){
        req.product=product;
        return next();
    }).catch(()=>{return res.status(404).json({'message':'등록된 상품이 없습니다.','status':'404'})});
})

const create = async function createProduct(req, res, next) {
    const user = await User.findById(req.payload.id)
    if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
    const product = new Product(req.body.product)
    if(!req.body.product) return res.status(200).json({'message':"잘못된 접근입니다.",'status':200})
    if (!req.body.product.itemName||!req.body.product.price||!req.body.product.itemImage||!req.body.product.link) return res.status(422).json({'message':"필수 입력사항을 입력해주세요.",'status':'422'});
    if(typeof(req.body.product.price)==='string') return res.status(422).json({'message':'가격은 숫자로 입력하셔야 합니다.','status':'422'});
    product.author = user
    try{
        await product.save()
        return res.json({product:product.toProductJSONFor(user)})
    }
    catch(error){
        next;
    }
}

router.param('accountname',(req,res,next,accountname)=>{
    User.findOne({accountname:accountname}).then((user)=>{
        if (!user) return res.status(404).json({'message':"해당 계정이 존재하지 않습니다.",'status':'404'});
        req.user=user;
        next();
    }).catch(next);
  })

const userproduct = async function userproduct(req,res,next){
    const limit = req.query.limit ? Number(req.query.limit):10
    const skip = req.query.skip ? Number(req.query.skip):0

    try {
      const user = await User.findById(req.payload.id)
      const product = await Product.find({author:req.user}).limit(limit).skip(skip).sort({createdAt:'descending'}).populate('author');    
      console.log(product)
      return res.status(200).json({data:product.length,product:product.map(product=>product.toProductJSONFor(user))})
    } 
    catch (error) {
        next()
    }
}

const productlist = async (req,res,next)=>{
    const limit = req.query.limit ? Number(req.query.limit):10
    const skip = req.query.skip ? Number(req.query.skip):0
    const product = await Product.find({}).sort({createdAt:'descending'}).limit(limit).skip(skip).populate('author');

    res.status('200').json({
        data:product.length,
        product,
    })
}

const productUpdate=async function (req,res,next){
    if(req.payload.id.toString() === req.product.author._id.toString()){
        await Product.findByIdAndUpdate(req.product._id,req.body.product)
        const user = await User.findById(req.payload.id)
        const product = await Product.findById(req.product._id).populate('author')
        return res.json({product: product.toProductJSONFor(user)})
    }
    return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
}

const productremove= async function (req,res,next){
    if(req.payload.id.toString() === req.product.author._id.toString()){
        await Product.findByIdAndDelete(req.product._id,req.body.product)
        return res.status(200).json({'message':"삭제되었습니다.",'status':'200'})
    }
    return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
}

router.get('/',productlist)
router.get('/:accountname', userproduct);
router.post('/',create); 
router.put('/:product',productUpdate); 
router.delete('/:product',productremove); 

module.exports = router;