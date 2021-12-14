var mongoose=require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');
var crypto=require('crypto');
var jwt=require('jsonwebtoken');
var secret=require('../config').secret;

var UserSchema = new mongoose.Schema({
    username:{type:String, index:true},
    image:{type:String},
    email:{type:String, lowercase:true, unique:true, required:[true, "필수 입력 사항입니다."], match: [/\S+@\S+\.\S+/, '잘못된 이메일 형식입니다.'],index:true},
    accountname:{type:String, unique:true, required:[true, "필수 입력 사항입니다."],index:true},
    intro:{type:String},
    hearts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    follower:[{type:mongoose.Schema.Types.ObjectId, ref:'User' }],
    followCount:{type:Number, default: 0},
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
        username:this.username,
        email:this.email,
        accountname:this.accountname,
        intro:this.intro,
        token:this.generateJWT(),
        refreshToken:this.refreshJWT()
    }
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
    // var follower = await mongoose.model('User').find({following:{$in:this._id}})
    return {
        _id: this._id,
        username:this.username,
        accountname:this.accountname,
        intro:this.intro,
        following:user?user.isfollowing(this._id):false,
        follower:this.follower,
        followerCount:this.followerCount
    }
}

UserSchema.methods.follow=function(id){
    const user = this
    if(this.following.indexOf(id)===-1){
        this.following.push(id);
    }
    return this.updateOne({id:this._id},{following:this.following},);
}

UserSchema.methods.addFollower = function(id) {
    const user = this
    if(this.follower.indexOf(id)===-1){
        this.follower.push(id);
    }

    
    return user.updateOne({id:this._id},{follower:this.follower},);
}

UserSchema.methods.unfollows=function(id){
    // console.log(this.following);

    this.following.remove(id);
    // console.log(this.following);
    return this.updateOne({following:id},);
    // console.log(this)
}

UserSchema.methods.isfollowing=function(id){
    return this.following.some(function(followId){
        return followId.toString()===id.toString();
    });
}


mongoose.model('User',UserSchema);
