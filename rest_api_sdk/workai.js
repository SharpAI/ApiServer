'use strict'

var http = require('http')
var request = require('./index')

  // #   insert_msg2(
  // #     '7YRBBDB72200271715027668215821893',
  // #     'http://workaiossqn.tiegushi.com/8acb7f90-92e1-11e7-8070-d065caa7da61',
  // #     '28DDU17602003551',
  // #     'face',
  // #     '0.9',
  // #     '100',
  // #     '0',
  // #     'front',
  // #     1506588441021,
  // #     1506588441021,
  // #     ''
  // #   )

//workAI 识别信息消息
request.post(
  'http://workaicdn.tiegushi.com/restapi/workai',{
  body: {
    'id':'7YRBBDB72200271715027668215821893',
    'uuid':'28DDU17602003551',
    'img_url': 'http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f',
    'type': 'face',
    'tid': '',
    'accuracy': null,
    'sqlid': 0,
    'current_ts': 1522276593387.0,
    'accuracy': '0.9',
    'fuzziness': 100,
    'style': 'front',
    'img_ts': '1506588441021.0',
    'current_ts':'1506588441021',
    'p_ids': ''
  },
  json:true
}, 
function (err, res, body) {
  console.log('err:',err)
  console.log('res:',res.body)
  console.log('body:',body)
})
