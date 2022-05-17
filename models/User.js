// 몽구스를 이용해서 만드는 'userSchema' 와 'User' 모델

const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema) // 'User' 라는 모델로 감싸줍니다.

module.exports = { User } // 'User' 모델을 다른 곳에서도 사용할 수 있도록 exports 시켜줍시다.