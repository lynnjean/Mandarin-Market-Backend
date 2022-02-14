const mongoose=require('mongoose'),
User=mongoose.model('User');

const account={
    account:(req,res,next)=>{
        User.findById(req.payload.id).then((user)=>{
            return res.json({profile:req.profile.toProfileJSONFor(user)})
        });
    }
}

module.exports=account;
