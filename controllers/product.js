const mongoose = require('mongoose'),
Product = mongoose.model('Product'),
User = mongoose.model('User');

const product={
    create : async function createProduct(req, res, next) {
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
    },
    userproduct : async function userproduct(req,res,next){
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
    },
    productlist : async (req,res,next)=>{
        const limit = req.query.limit ? Number(req.query.limit):10
        const skip = req.query.skip ? Number(req.query.skip):0
        const product = await Product.find({}).sort({createdAt:'descending'}).limit(limit).skip(skip).populate('author');
    
        res.status('200').json({
            data:product.length,
            product,
        })
    },
    productInfo:async function (req,res,next){
        const user = await User.findById(req.payload.id)
        await req.product.populate('author')
        return res.status(200).json({product: req.product.toProductJSONFor(user)})
    },
    productUpdate:async function (req,res,next){
        if(req.payload.id.toString() === req.product.author._id.toString()){
            await Product.findByIdAndUpdate(req.product._id,req.body.product)
            const user = await User.findById(req.payload.id)
            const product = await Product.findById(req.product._id).populate('author')
            return res.json({product: product.toProductJSONFor(user)})
        }
        return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    },
    productremove: async function (req,res,next){
        if(req.payload.id.toString() === req.product.author._id.toString()){
            await Product.findByIdAndDelete(req.product._id,req.body.product)
            return res.status(200).json({'message':"삭제되었습니다.",'status':'200'})
        }
        return res.status(403).json({'message':"잘못된 요청입니다. 로그인 정보를 확인하세요",'status':'403'})
    }
}

module.exports=product;