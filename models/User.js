var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');
var crypto=require('crypto');
var  jwt=require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    username:{type:String, index:true},
    email:{type:String, lowercase:true, unique:true, required:[true, "필수 입력 사항입니다."], match: [/\S+@\S+\.\S+/, '잘못된 이메일 형식입니다.'],index:true},
    accountname:{type:String, unique:true, required:[true, "필수 입력 사항입니다."],index:true},
    intro:{type:String},
    hash:{type:String},
    salt:{type:String}
})

UserSchema.plugin(uniqueValidator,{message:'is already token'})

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  };
  
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT=()=>{
    var today=new Date()
    var exp=new  Date(today)
    exp.setDate(today.getDate()+60)

    return jwt.sign({
        id:this._id,
        username:this.username,
        exp:parseInt(exp.getTime()/1000),
    });
};

UserSchema.method.toAuthJson=()=>{
    return {
        username:this.username,
        email:this.email,
        accountname:this.accountname,
        token:this.generateJWT()
    }
}

mongoose.model('User',UserSchema);
