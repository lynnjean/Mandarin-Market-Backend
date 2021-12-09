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
    product.author = user
    product.save()
    return res.json({product:product.toProductJSONFor(user)})
}

router.get('/',async (req,res,next)=>{
    var limit=10;
    var offset=0;

    if (typeof req.query.limit!=='undefined'){
        limit=req.query.limit;
    }
    if (typeof req.query.offset!=='undefined'){
        offset=req.query.offset;
    }

    const products = await Product.find({}).sort({createdAt:'descending'}).limit(Number(limit)).skip(Number(offset)).populate('author');
    res.status('200').json({
        status: 'ok',
        data: products.length,
        products,
    })
})

router.post('/',create)

router.param('product',function(req,res,next,_id){
    Product.findById({_id:_id}).populate('author')
    .then((product)=>{
        if(!product) return res.status(404);
        req.product=product;
        next();
    }).catch(next);
})

router.get('/:product',auth.optional,(req,res,next)=>{
    Promise.all([
        req.payload ? User.findById(req.payload.id):null,
        req.product.populate('author')
    ]).then((results)=>{
        var user=results[0];
        return res.json({product:req.product.toProductJSONFor(user)})
    }).catch(next);
})

router.put('/:product',function (req,res,next){
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
        }else return res.status(403);
    })
})

router.delete('/:product',function (req,res,next){
    User.findById(req.payload.id).then((user)=>{
        if (!user) return res.status(401);

        if(req.product.author._id.toString() === req.payload.id.toString()){
                req.product.remove()
                .then(function(){
                    res.sendStatus(204);
                });
        } else return res.sendStatus(403);
    })
    console.log(req.product)
})

module.exports = router;