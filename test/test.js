var mqtt = require('mqtt')
var crypto = require("crypto");
var client  = mqtt.connect('mqtt://mq.tiegushi.com:8080',{qos:1})

var count = 0

client.on('connect', function () {
    console.log('connected')
    setInterval(function(){
      send_message("hello message ")
      //send_message_1()
      //send_message_2()
    },1)
})

function get_id(){
   var the_id = crypto.randomBytes(10).toString('hex');
   return the_id
}

function send_message(text){
  var message = {
    "msgId":"5711ba11299959edb8878422",
    "_id":"1f5d6f7dc3ad251fc8156125",
    "form":{"id":"J6qtu6R4ATiPgAxhj","name":"yun123","icon":"/userPicture.png"},
    "to":{"id":"05349a5752bbc009a2e37b21","name":"testmsg","icon":""},
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
  client.publish("/msg/g/05349a5752bbc009a2e37b21",JSON.stringify(message),{qos:1})
//  client.publish("/msg/g/64e48cc862ad19681e76038e",JSON.stringify(message),{qos:1})
}

function send_message_1(){
  var message = {
    "_id":"60dd64e52f239e1cd01dfd96",
    "form":{
      "id":"Y5B97m54rCSkz4MXP","name":"Ok","icon":"/device_icon_192.png"
    },
    "to":{"id":"e4fa875a84ab323a8a03fb37","name":"消息测试专用群","icon":""},
    "images":[
      {
        "_id":"714a9dbcfe0e1ece17fc770f",
        "id":"28D6R1761200021015212421990120118",
        "people_his_id":"QRxJ77cdsWd4G4GKk",
        "url":"http://workaiossqn.tiegushi.com/73bb4d70-4f02-11e8-a113-c486e98726d5",
        "label":"Edward Huang",
        "img_type":"face",
        "accuracy":"0.96",
        "fuzziness":"700",
        "sqlid":"0",
        "style":"front",
        "p_ids":[]
      }
    ],
    "to_type":"group",
    "type":"text",
    "text":"AI观察到 Edward Huang:",
    "create_time":"2018-05-03T18:47:35.444Z",
    "people_id":"28D6R1761200021015212421990120118",
    "people_uuid":"28D6R17612000210",
    "people_his_id":"QRxJ77cdsWd4G4GKk",
    "wait_lable":false,
    "is_people":true,
    "is_read":false,
    "tid":"28D6R176120002101525373254910"
  }

  message.msgId = get_id()
  message._id = get_id()
  message.create_time = new Date()
  message.text = message.text + String(count++)
  message.images[0]._id = get_id()
  //message.images[0].id = get_id()
  console.log(message)
  client.publish("/msg/g/e4fa875a84ab323a8a03fb37",JSON.stringify(message),{qos:1})
}
function send_message_2(){
  var message = {
    "_id":"e543b538145296f30be61eec",
    "form":{
      "id":"2pTzHXTtQuY3ktsAd",
      "name":"b8ca3abc9bb1",
      "icon":"/device_icon_192.png"
    },
    "to":{"id":"8baa4059179c404e721fa103","name":"testmessage","icon":""},
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
  client.publish("/msg/g/e4fa875a84ab323a8a03fb37",JSON.stringify(message),{qos:1})
}
