// 몽구스를 이용해서 만드는 'userSchema' 와 'User' 모델

const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // 암호화 시켜주는 모듈 > salt를 먼저 생성하고, 생성된 salt를 이용해서 암호화 시킨다.
const saltRounds = 10 // 10자리의 salt를 이용해서 암호화하게끔
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({ // User스키마를 만들자
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 공백을 삭제해주는 설정 값
        unique: 1 // 중복을 막아주는 설정 값
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { // 유저의 회원등급 관련
        type: Number,
        default: 0
    },
    image: String,
    token: { // 유저의 유효성 검사 관련
        type: String
    },
    tokenExp: { // token의 유효기간 관련
        type: Number
    }
})

userSchema.pre('save', function(next){ // save 라는 작업이 진행되기전(pre)에 할 function 정의, 그리고 next()라는 메소드로 다음 save함수를 진행
    // 비밀번호를 암호화 시키는 내용 넣기

    var user = this; // 현재 모델을 가리킴
    
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
    
                user.password = hash
                next()
            })
        })   
    } else {
        next()
    }

})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {

    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기

    var token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })


}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // 토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded){
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema) // 'User' 라는 모델로 감싸줍니다.

module.exports = { User } // 'User' 모델을 다른 곳에서도 사용할 수 있도록 exports 시켜줍시다.