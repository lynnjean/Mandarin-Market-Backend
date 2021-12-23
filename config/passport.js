var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var mongoose=require('mongoose');
var User=mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField:'user[email]',
    passwordField:'user[password]'
},(email,password,done)=>{
    User.findOne({email:email}).then((user)=>{
        if(!user || !user.validPassword(password))
            return done(null,false,{'message':"이메일 또는 비밀번호가 일치하지 않습니다.",'status':422});
        return done(null,user);
    }).catch(done);
}));