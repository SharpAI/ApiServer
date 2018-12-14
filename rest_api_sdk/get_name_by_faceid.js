'use strict'

var http = require('http')
var request = require('./index')

//通过组id和识别id获取用户名字
request.get({
  url:'http://localhost:3000/restapi/get_name_by_faceid',
  qs: {
    group_id:'e0288263481d07053fe4b79d',
    face_id:'28D6R1750500107015078565061720863'
  }
}, 
function (err, res, body) {
  console.log('err:',err)
  console.log('res:',res.body)
  console.log('body:',body)
})
