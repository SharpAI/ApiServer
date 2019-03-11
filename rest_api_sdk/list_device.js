'use strict'

var http = require('http')
var request = require('./index')

//查看设备信息
request.get({
  url:'http://workaicdn.tiegushi.com/restapi/list_device',
  qs: {
    uuid:'28DDU17602003551'
  }
}, 
function (err, res, body) {
  console.log('err:',err)
  console.log('res:',res.body)
  console.log('body:',body)
})
