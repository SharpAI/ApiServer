var mqtt = require('mqtt')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var redisClient = require('./lib/redis.js')
var f = require('./lib/foreach.js')
var workQueue = require('./lib/work_queue.js')

var serverUrl = process.env.SERVER_URL || 'http://host1.tiegushi.com/';
var MQTT_URL = process.env.MQTT_URL;
var DB_CONN = process.env.MONGO_URL;
var db = null;
var debug_on = process.env.DEBUG_MESSAGE || false;
var allowGroupNotification = process.env.ALLOW_GROUP_NOTIFICATION || false;
var projectName = process.env.PROJECT_NAME || null; // '故事贴：t , 点圈： d'

var client;
var statusRecordInfo = null;
var subscribeTopic = '/msg/#';
if(projectName){
  subscribeTopic = '/'+projectName+'/msg/#';
}

function mqttPushNotificationInit() {
    workQueue.workQueueInit(checkTTLAndSendNotification);

    MongoClient.connect(DB_CONN, {poolSize:20 , reconnectTries: Infinity}, function(err, mongodb){
      if (err) {
        console.log('Mongo connect Error:' + err);
      }
      console.log('Mongo connect');
      db = mongodb;
      db.on('timeout',     function(){console.log('MongoClient.connect timeout')});
      db.on('error',       function(){console.log('MongoClient.connect error')});
      db.on('close',       function(){console.log('MongoClient.connect close')});
      db.on('reconnect',   function(){
          console.log('MongoClient.connect reconnect')
      });
    });

    if (workQueue.isMaster()) {
        client  = mqtt.connect(MQTT_URL);
        client.on('connect', function () {
          console.log('mqtt connected')
          mqttReporterInit();
          client.subscribe(subscribeTopic,{qos:1},function(err,granted){
            console.log('Granted is '+JSON.stringify(granted))
          });
        });

        client.on('message', function (topic, message) {
          if(!db)
              return;

          // message is Buffer
          debug_on && console.log(topic)
          var msgObj = JSON.parse(message.toString());
          //if(msgObj && msgObj.to && msgObj.to.id && msgObj.to.id != 'd2bc4601dfc593888618e98f')
          debug_on && console.log('mqtt msg ==>', msgObj)

          // 处理故事贴的故事群
          if (projectName && topic.startsWith('/'+projectName+'/msg/g/')){
            if (msgObj.type === 'haveReadMsg') {
              return;
            }
            sendGroupNotification2(db, msgObj, 'groupmessage');
          } else if(allowGroupNotification && topic.match('/msg/g/')){
              //if(msgObj && msgObj.to && msgObj.to.id && msgObj.to.id != 'd2bc4601dfc593888618e98f')
              sendGroupNotification(db,msgObj,'groupmessage');
          }
          if(topic.match('/msg/u/')){
              //sendNotification(msgObj, msgObj.to.id,'usermessage');
              if (msgObj.type === 'haveReadMsg') {
                return;
              }
              sendUserNotification(db, msgObj, 'usermessage');
          }
        });
        client.on('reconnect', function () {
            client.unsubscribe(subscribeTopic);
            console.log('reconnect to mqtt server');
        });
        client.on('close', function () {
            client.unsubscribe(subscribeTopic);
            console.log('close to mqtt server');
        });
        client.on('disconnect', function (topic, message) {
            client.unsubscribe(subscribeTopic);
            console.log('disconnected')
        });
        client.on('offline', function () {
            client.unsubscribe(subscribeTopic);
            console.log('disconnected')
        });
        client.on('error', function () {
            client.unsubscribe(subscribeTopic);
            console.log('error to mqtt server');
        });
    }
    else {
        if(process.env.REDIS_HOST && process.env.REDIS_PASSWORD) {
            redisClient.redisClientInit();
        }
    }
}

function checkTTLAndSendNotification(id, item, callback) {
    if (workQueue.isMaster()) {
        console.log(">>> master checkTTLAndSendNotification id= " + id + " item=" + JSON.stringify(item))
        return callback && callback();
    }

    //send motion message Notification
    if (item && item.msg && item.msg.event_type && item.msg.event_type == "motion") {
        sendNotification(item.msg, item.userid, item.type, function(err) {
            if(err)
                debug_on && console.log('sendGroupNotification: err=' + err);
            else
                console.log('------- sendGroupNotification: send to ' + item.userid);
            return callback && callback();
        })
    }
    else if(item && item.key && item.msg && item.userid && item.type) {
        redisClient.redisUpdateKey(item.key, function(ttl) {
            if(ttl <= 1) {
                sendNotification(item.msg, item.userid, item.type, function(err) {
                    if(err)
                        debug_on && console.log('sendGroupNotification: err=' + err);
                    else
                        console.log('------- sendGroupNotification: send to ' + item.userid);
                    return callback && callback();
                })
            }
            else {
                console.log('ingore notification ' + item.key + ' ttl=' + ttl)
                return callback && callback();
            }
        });
    }
    else {
        console.log('invalid data')
        return callback && callback();
    }
}

function cloneMsgToAssociatedUsers(toUser, message) {
  if(!toUser || !toUser._id || !toUser.profile || !toUser.profile.associated)
    return;

  var msg = {};
  for (var key in message)
    msg[key] = message[key];

  if(!msg || !msg.to || !msg.to.id || !msg.to.name || !msg.to.icon || msg.ttl)
    return;

  var associated = toUser.profile.associated;
  var users = db.collection('users');
  for(var i=0; i<associated.length; i++) {
    var oneUser = associated[i];
    if (!oneUser || !oneUser.id || !oneUser.name || !oneUser.icon)
      return console.log('user not found: ' + associated[i]);

    users.findOne({ _id: oneUser.id }, {fields: {
      type: true,
      token: true,
      profile: true
    }}, function (err, _toUser) {
      // 不在转发 mqtt 的消息给 web 用户
      // if (!err && _toUser && _toUser.profile && _toUser.profile.browser && !_toUser.token)
      //   return console.log('mqtt msg by web-user', _toUser._id);
      
      msg.to.id   = oneUser.id;
      msg.to.name = oneUser.name;
      msg.to.icon = oneUser.icon;
      msg.ttl = 1;
      try {
        client.publish('/t/msg/u/'+oneUser.id, JSON.stringify(msg), {qos:1});
        debug_on && console.log('>>> send ' + JSON.stringify(msg))
      } catch(e){};
    });
  }
}

function sendNotification(message, toUserId ,type, cb) {
  var toUserId = toUserId;
  var userId = message.form.id;

  var users = db.collection('users');
  var pushTokens = db.collection('pushTokens');
  var PushMessages = db.collection('pushmessages');
  var webUserMessages = db.collection('webUserMessages');

  users.findOne({ _id: toUserId }, {fields: {
    type: true,
    token: true,
    profile: true
  }}, function (err, toUser) {
    if (err) {
      console.log('Error:'+err)
      return cb && cb(err);
    }

    if(projectName && projectName == 't' && message.to_type != 'group')
      cloneMsgToAssociatedUsers(toUser, message);

    if (toUser && toUser.type && toUser.token) {
      pushTokens.findOne({ type: toUser.type, token: toUser.token }, function (err, pushTokenObj) {
        if (err) {
          console.log('Error:' + err);
          return cb && cb(err);
        }
        if (!pushTokenObj || pushTokenObj.userId !== toUser._id) {
          return cb && cb('pushToken not found');
        }
        var content = '';
        var msgText = '';
        var pushToken = {
          type: toUser.type,
          token: toUser.token
        };
        if(message.type === 'image'){
          msgText = '[图片]';
        } else {
          msgText = message.text;
        }
        if(type == 'usermessage'){
            content = message.form.name+ ': ' + msgText;
        }
        if(type === 'groupmessage'){
          if(message.is_people)
            content = message.to.name+ ': ' + ' 有新消息';
          else
            content = message.to.name+ ': ' +  msgText;
        }
        var commentText = '';
        var extras = {
          type: type,
          messageId: message._id
        }
        var waitReadCount = (toUser.profile && toUser.profile.waitReadCount) ? toUser.profile.waitReadCount : 1;
        var tidyDoc = {
          _id: message._id,
          form: message.form.id,
          to: message.to.id,
          to_type: message.to_type,
          type: message.type,
          text: message.text,
          create_time: message.create_time
        };

        var dataObj = {
          fromserver: encodeURIComponent(serverUrl),
          eventType: type,
          doc: tidyDoc,
          userId: userId,
          content: content,
          extras: extras,
          toUserId: toUserId,
          pushToken: pushToken,
          waitReadCount: waitReadCount
        }
        var dataArray = [];
        dataArray.push(dataObj);
        debug_on && console.log(JSON.stringify(dataArray))
        PushMessages.insert({pushMessage: dataArray, createAt: new Date()},function(err,result){
          if(err){
            console.log('Error:'+err);
            return cb && cb(err);
          } else {
            debug_on && console.log(result)
            return cb && cb(null);
          }
        });
      });
    }
    else {
      // web 用户
      if (projectName && projectName == 't' && !message.ttl && toUser && toUser.profile && toUser.profile.browser && !toUser.token){
        try{
        // message._id = new ObjectId().toString();
        webUserMessages.insert(message, function(err,result){
          try{
          if (err)
            return console.log('mqtt to web-user msg err:', err);
          users.update({_id: toUser._id}, {$inc: {'profile.waitReadMsgCount': 1}}, function(error){
            try{
            if(error)
              users.update({_id: toUser._id}, {$set: {'profile.waitReadMsgCount': 1}});
            }catch(e){}
          });
          console.log('web用户的mqtt消息写入数据库成功', toUser._id);
          }catch(e){}
        });
        }catch(e){}
      }
      
      return cb && cb('toUser/type/token not found');
    }
  });
}

function sendUserNotification(db, message, type){
  var BlackList = db.collection('blackList');
  var toUserId  = message.to.id;
  var userId    = message.form.id;
  BlackList.findOne({blackBy: toUserId,blacker:{$in:[userId]}},function(err, result){
    if (err){
      debug_on && console.log('mongo blackList Error:',err);
      return
    }

    if (result) {
      debug_on && console.log('在对方黑名单中， userId='+ userId +' ,toUserId='+ toUserId);
      return
    }
    sendNotification(message, toUserId, type, function(err) {
        if(err){
            console.log('sendUserNotification: err=' + err);
        } else {
          updateSucc()
        }
    });
  });
};

function sendGroupNotification2(db, message, type){
  var groupUsers = db.collection('simple_chat_groups_users');
  var MuteNotification = db.collection('mutenotification');

  var groupId = message.to.id;
  groupUsers.find({group_id:  groupId, is_post_group: true}).toArray(function(err, docs) {
    if(err){
      return
    }
    forEachAsynSeriesWait(docs, 5, 10, function(doc, index, callback) {
      MuteNotification.findOne({'groupId':groupId,'userId':doc.user_id},function(err, result){
        if (err){
          console.log('mongo MuteNotification Error:',err);
          if(message.form.id != doc.user_id && doc.user_id) {
            sendNotification(message, doc.user_id, type, function(err) {
                if(err){
                    console.log('sendGroupNotification: err=' + err);
                } else {
                  updateSucc()
                }
                return callback && callback();
            });
          } else {
            return callback && callback();
          }
        }
        if(result && result.mutestatus == true){
          return;
        } else if(message.form.id != doc.user_id && doc.user_id) {
          sendNotification(message, doc.user_id, type, function(err) {
              if(err){
                  console.log('sendGroupNotification: err=' + err);
              } else {
                updateSucc()
              }
              return callback && callback();
          });
        } else {
          return callback && callback();
        }
      });
    }, function() {
      console.log('send GroupNotification complete, messageForm:',JSON.stringify(message.form));
    });
  });
};

function sendGroupNotification(db, message, type){
  var groupUsers = db.collection('simple_chat_groups_users');

  var groupId = message.to.id;
  groupUsers.find({group_id:  groupId}).toArray(function(err, docs) {
    if(err){
      return
    }

    forEachAsynSeriesWait(docs, 5, 10, function(doc, index, callback) {
        if(message.form.id != doc.user_id) {
            var keystring = 'Train_' + groupId + '_' + doc.user_id;
            debug_on && console.log('>>> add task to queue, user_id=' + keystring);
            workQueue.createTaskToKueQueue(keystring, {key: keystring, msg: message, userid: doc.user_id, type: type});
            return callback && callback();
        }
        else
            return callback && callback();
    }, function() {
        console.log('send GroupNotification complete, messageForm:',JSON.stringify(message.form));
    })
  });
};
function mqttReporterInit(){
  updateSucc = function(){
    statusRecordInfo.succ++;
  }
  function initStatusRecord(){
    statusRecordInfo = {
      service: process.env.SERVICE_NAME ? process.env.SERVICE_NAME:'MQTT_IOS_Notification',
      production: process.env.PRODUCTION ? true:false,
      serviceIndex: process.env.SERVICE_INDEX ? process.env.SERVICE_INDEX:0,
      succ: 0,
      detail:{}
    }
  }
  function reportStatusToMQTTBroker(){
    if(client)
        client.publish('status/service', JSON.stringify(statusRecordInfo), {qos:1});
    initStatusRecord();
  }
  initStatusRecord();
  setInterval(reportStatusToMQTTBroker,30*1000);
}
mqttPushNotificationInit();
