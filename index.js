const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { User } = require("./models/User");
const config = require("./config/key");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요');
});

app.post('/api/users/register', (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body)
  user.save((err, doc) => {  // 몽구스에서 제공하는 DB에 저장하는 메소드 save
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {
  
  // todo 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    
    // todo 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인 한다.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." });
      
      // 비밀번호까지 맞다면 DB의 해당 유저의 Token 필드에 토큰을 생성해서 넣어준다.
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 클라이언트쪽 쿠키에도 저장한다.
        res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id });

      })
    })
  })

})


app.get('/api/users/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.iamge
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id },{ token: "" }, (err, user) => {
    if(err) return res.json({success: false, err});
    return res.status(200).send({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});