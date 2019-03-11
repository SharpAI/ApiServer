'use strict'

var http = require('http')
var request = require('./index')

//删除设备
request.get({
  url:'http://workaicdn.tiegushi.com/restapi/clean_device',
  qs: {
    uuid:'2fcccc9f'
  }
}, 
function (err, res, body) {
  console.log('err:',err)
  console.log('res:',res.body)
  console.log('body:',body)
})
