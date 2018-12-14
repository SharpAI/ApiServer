'use strict'

var http = require('http')
var request = require('./index')

// # Faces API
// # [{
// #   'id': id,
// #   'uuid': uuid,
// #   'group_id': current_groupid,
// #   'img_url': url,
// #   'position': position,
// #   'type': img_type,
// #   'current_ts': int(time.time()*1000),
// #   'accuracy': accuracy,
// #   'fuzziness': fuzziness,
// #   'sqlid': sqlId,
// #   'style': style,
// #   'img_ts': img_ts,
// #   'p_ids': p_ids,
// # }]
//接受人脸识别数据
request.post(
  'http://localhost:3000/restapi/workai/faces_json',{
  body: {
    "id":"28D6R16C1200588515222765925380176",
    "uuid":"28D6R16C12005885",
    "group_id": "a4fbc3b9cb484bba568047a6",
    "img_url": "http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f",
    "position": null,
    "type": "face",
    "current_ts": 1522276593387.0,
    "accuracy": false,
    "fuzziness": 443,
    "sqlid": 0,
    "style": "front",
    "img_ts": "1522276708297.0",
    "p_ids": "28D6R16C1200588515222767051010314"
  },
  json:true
}, 
function (err, res, body) {
  console.log('err:',err)
  console.log('res:',res.body)
  console.log('body:',body)
})