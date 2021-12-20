var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');
var crypto=require('crypto');
var jwt=require('jsonwebtoken');
var secret=require('../config').secret;

var UserSchema = new mongoose.Schema({
    username:{type:String,required:[true, "필수 입력 사항입니다."]},
    image:{type:String},
    email:{type:String, lowercase:true, unique:true, required:[true, "필수 입력 사항입니다."], match: [/\S+@\S+\.\S+/, '잘못된 이메일 형식입니다.'],index:true},
    accountname:{type:String, unique:true, required:[true, "필수 입력 사항입니다."],match:/^[_.a-zA-Z0-9|s]*$/,index:true},
    intro:{type:String},
    hearts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    follower:[{type:mongoose.Schema.Types.ObjectId, ref:'User' }],
    // followerCount:{type:Number, default: 0},
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
        exp:parseInt(exp.getTime()/1000),
    },secret)
};

UserSchema.methods.refreshJWT= function (){
    return jwt.sign({},secret,{expiresIn:'14d'})
}

UserSchema.methods.toAuthJson= function(user){
    return {
        _id:this._id,
        username:this.username,
        email:this.email,
        accountname:this.accountname,
        intro:this.intro,
        image:this.image || '/uploadFiles/Ellipse.png',
        token:this.generateJWT(),
        refreshToken:this.refreshJWT()
    }
}

UserSchema.methods.userDelete=function(res,id){
    this.remove(id);
    return true
}

UserSchema.methods.heart=function(id){
    if(this.hearts.indexOf(id)===-1){
        this.hearts.push(id);
    }
    return this.updateOne({hearts:id},);
}

UserSchema.methods.unhearts=function(id){
    this.hearts.remove(id);
    return this.updateOne({hearts:this.hearts},);
}

UserSchema.methods.ishearts=function(id){
    return this.hearts.some(function(heartId){
        return heartId.toString()===id.toString();
    });
}

UserSchema.methods.toProfileJSONFor= function(user){
    return {
        _id: this._id,
        username:this.username,
        accountname:this.accountname,
        intro:this.intro,
        image:this.image,
        following:this.following,
        follower:this.follower,
        followerCount:this.follower.length,
        followingCount:this.following.length
    }
}

UserSchema.methods.follow=function(id){
    if(this.following.indexOf(id)===-1){
        this.following.push(id);
    }
    return this.updateOne({following:this.following},);
}

UserSchema.methods.addFollower = function(id) {
    if(this.follower.indexOf(id)===-1){
        this.follower.push(id);
    }
    return this.updateOne({id:this._id},{follower:this.follower},);
}
UserSchema.methods.removeFollower = function(id){
    this.follower.remove(id);
    return this.updateOne({id:this._id},{follower:this.follower},);
}
UserSchema.methods.unfollow=function(id){
    this.following.remove(id);
    return this.updateOne({id:this._id},{following:this.following},);
}

UserSchema.methods.isfollowing=function(id){
    return this.following.some(function(followId){
        return followId.toString()===id.toString();
    });
}

mongoose.model('User',UserSchema);
