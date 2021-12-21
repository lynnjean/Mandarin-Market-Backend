var mongoose = require('mongoose')
var Product = mongoose.model('Product')
var User = mongoose.model('User')
var express=require('express');
const auth = require('./auth');
var router=express.Router();

router.use(auth.required);

const create = async function createProduct(req, res, next) {
    const user = await User.findById(req.payload.id)
    const product = new Product(req.body.product)
    if(!user) return res.status(401).json({'message':"존재하지 않는 유저입니다.",'status':'401'});
    if (!req.body.product.itemName||!req.body.product.price||!req.body.product.itemImage||!req.body.product.link) return res.status(422).json({'message':"필수 입력사항을 입력해주세요.",'status':'422'});
    if(typeof(req.body.product.price)==='string') return res.status(422).json({'message':'숫자만 입력하실 수 있습니다.','status':'422'});
    product.author = user
    product.save()
    return res.json({product:product.toProductJSONFor(user)})
}

const productlist = async (req,res,next)=>{
    var limit=10;
    var offset=0;

    if (typeof req.query.limit!=='undefined'){
        limit=req.query.limit;
    }
    if (typeof req.query.offset!=='undefined'){
        offset=req.query.offset;
    }

    const products = await Product.find({})
        .sort({createdAt:'descending'})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author');

    res.status('200').json({
        count:products.length,
        products,
    })
}

router.param('product',function(req,res,next,_id){
    Product.findById({_id:_id}).populate('author')
    .then((product)=>{
        if(!product) return res.status(404).json({'message':'등록된 상품이 없습니다.','status':'404'});
        req.product=product;
        next();
    }).catch(next);
})

const productUpdate=function (req,res,next){
    User.findById(req.payload.id).then((user)=>{
        
        if(req.product.author._id.toString() === req.payload.id.toString()){
            if(typeof req.body.product.itemName!=='undefined'){
                req.product.itemName=req.body.product.itemName
            }
            if(typeof req.body.product.price!=='undefined'){
                req.product.price=req.body.product.price
            }
            if(typeof req.body.product.link!=='undefined'){
                req.product.link=req.body.product.link
            }
            req.product.save().then(function(product){
                return res.json({product:product.toProductJSONFor(user)})                
            }).catch(next);
        }return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    })
}

const productremove=function (req,res,next){
    User.findById(req.payload.id).then((user)=>{
        if (!user) return res.status(401);
        if(req.product.author._id.toString() === req.payload.id.toString()){
                req.product.remove()
                .then(function(){
                    res.status(204);
                });
        } return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    })
}

router.get('/', productlist); //0
router.post('/',create); //0
router.put('/:product',productUpdate); //0
router.delete('/:product',productremove); //0

module.exports = router;