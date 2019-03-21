var mqtt = require('mqtt')
var crypto = require("crypto");
var client  = mqtt.connect('mqtt://mq.tiegushi.com:8080',{qos:1})

var count = 0

client.on('connect', function () {
    console.log('connected')
    setInterval(function(){
      send_message("hello message ")
      send_message_1()
      send_message_2()
    },100)
})

function get_id(){
   var the_id = crypto.randomBytes(10).toString('hex');
   return the_id
}

function send_message(text){
  //on mqtt message topic: /msg/g/c7100d084a78941996a0f975,
  //message: {"msgId":"3229ac4dd4e8a65b5c268e91","_id":"f50ad0d92ad40c0d06e5eae7",
  //"form":{"id":"Y5B97m54rCSkz4MXP","name":"Ok","icon":"/userPicture.png"},
  //"to":{"id":"c7100d084a78941996a0f975","name":"测试","icon":""},
  //"to_type":"group","type":"text","text":"11","create_time":"2019-01-04T20:55:21.270Z","is_read":false,"wait_classify":null}
  var message = {
    "msgId":"5711ba11299959edb8878422",
    "_id":"1f5d6f7dc3ad251fc8156125",
    "form":{"id":"Y5B97m54rCSkz4MXP","name":"Ok","icon":"/userPicture.png"},
    "to":{"id":"c7100d084a78941996a0f975","name":"测试","icon":""},
//"to":{"id":"64e48cc862ad19681e76038e","name":"FrankDebug","icon":""},
  "to_type":"group","type":"text","text":"嗨",
    "create_time":"2018-05-02T22:52:13.330Z",
    "is_read":false,
    "wait_classify":null
  }

  message.msgId = get_id()
  message._id = get_id()
  message.create_time = new Date()
  message.text = text + ' ' +String(count++)
  console.log(message)
  client.publish("/msg/g/c7100d084a78941996a0f975",JSON.stringify(message),{qos:1})
//  client.publish("/msg/g/64e48cc862ad19681e76038e",JSON.stringify(message),{qos:1})
}
function send_message_1(){
  var message = {"_id":"0a8abc38750244c7d9b1332b",
  "form":{"id":"HqmhgPL5pWZ3hi377","name":"in","icon":"/device_icon_192.png"},
  "to":{"id":"ad27ec20e985634880bde184","name":"Reardoor","icon":""},
  "images":[{"_id":"37b518707da2a539fbe323a2",
  "id":"28D6R1761200021015227794011381403",
  "people_his_id":"Lnkz2WKdEa5H9RGJL",
  "url":"http://workaiossqn.tiegushi.com/eed5cd10-1080-11e9-a931-c486e98726d5",
  "label":"Denny Qi","img_type":"face","accuracy":"0.56","fuzziness":"11",
  "sqlid":"0","style":"front","p_ids":[]}],"to_type":"group","type":"text",
  "text":"AI观察到 Denny Qi:","create_time":"2019-01-05T00:29:02.435Z",
  "people_id":"28D6R1761200021015227794011381403","people_uuid":"28D6R17612000210",
  "people_his_id":"Lnkz2WKdEa5H9RGJL","wait_lable":false,"is_people":true,"is_read":false,
  "tid":"28D6R176120002101546648142057"}

  message.msgId = get_id()
  message._id = get_id()
  message.create_time = new Date()
  message.text = message.text + String(count++)
  message.images[0]._id = get_id()
  //message.images[0].id = get_id()
  console.log(message)
  client.publish("/msg/g/c7100d084a78941996a0f975",JSON.stringify(message),{qos:1})
}
function send_message_2(){
  var message = {
    "_id":"e543b538145296f30be61eec",
    "form":{
      "id":"2pTzHXTtQuY3ktsAd",
      "name":"b8ca3abc9bb1",
      "icon":"/device_icon_192.png"
    },
    "to":{"id":"c7100d084a78941996a0f975","name":"测试","icon":""},
    "images":[
      {
        "_id":"eff20f3a88616aa3aaaacbf4",
        "url":"http://workaiossqn.tiegushi.com/Alro_1525385954386.gif"
      }
    ],
    "people_id":"people_id_gif",
    "to_type":"group",
    "type":"text",
    "text":"AI发现有陌生人活动",
    "create_time":"2018-05-03T19:00:42.580Z",
    "event_type":"motion",
    "is_read":false
  }

  //message.msgId = get_id()
  message._id = get_id()
  message.create_time = new Date()
  message.text = message.text + String(count++)
  message.images[0]._id = get_id()
  //message.images[0].id = get_id()
  console.log(message)
  client.publish("/msg/g/c7100d084a78941996a0f975",JSON.stringify(message),{qos:1})
}
