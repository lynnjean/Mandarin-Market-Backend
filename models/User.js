var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');
var crypto=require('crypto');
var jwt=require('jsonwebtoken');
var secret=require('../config').secret;

var UserSchema = new mongoose.Schema({
    username:{type:String, index:true},
    email:{type:String, lowercase:true, unique:true, required:[true, "필수 입력 사항입니다."], match: [/\S+@\S+\.\S+/, '잘못된 이메일 형식입니다.'],index:true},
    accountname:{type:String, unique:true, required:[true, "필수 입력 사항입니다."],index:true},
    intro:{type:String},
    hearts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    hash:{type:String},
    salt:{type:String}
},{timestamps:true});

UserSchema.plugin(uniqueValidator,{message:'is already token'})

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  };
  
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT= function (){
    var today=new Date()
    var exp=new Date(today)
    exp.setDate(today.getDate()+60)

    return jwt.sign({
        id:this._id,
        username:this.username,
        exp:parseInt(exp.getTime()/1000),
    },secret)
};

UserSchema.methods.refreshJWT= function (){
    return jwt.sign({},secret,{expiresIn:'14d'})
}

UserSchema.methods.toAuthJson= function(user){
    return {
        username:this.username,
        email:this.email,
        accountname:this.accountname,
        token:this.generateJWT(),
        refreshToken:this.refreshJWT()
    }
}

UserSchema.methods.toProfileJSONFor= function(user){
    return {
        _id: this._id,
        username:this.username,
        accountname:this.accountname,
        intro:this.intro
    }
}

UserSchema.method.heart=function(id){
    if(this.hearts.indexOf(id)===-1){
        this.hearts.push(id);
    }return this.save()
}

UserSchema.methods.unhearts=function(id){
    this.hearts.remove(id);
    return this.save();
}

UserSchema.methods.inhearts=function(id){
    return this.hearts.some(function(heartId){
        return heartId.toString()==id.toStfing();
    });
}


mongoose.model('User',UserSchema);
