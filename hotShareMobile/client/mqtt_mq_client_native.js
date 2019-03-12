/**
 * Created by simba on 5/12/16.
 */

function isJSON(message) {
  if (typeof (message) == 'object' &&
    Object.prototype.toString.call(message).toLowerCase() == '[object object]' && !message.length) {
    return true;
  } else {
    return false;
  }
}

if (Meteor.isClient && withNativeMQTTLIB) {
  var network_status = '';

  Meteor.startup(function () {
    var undeliveredMessages = [];
    var unsendMessages = [];
    var uninsertMessages = [];
    var uninsertMessages_msgKey = [];
    var init_timer = null;
    var connected = false;
    var noMessageTimer = null;
    Session.set('history_message', false);
    Session.set('offlineMsgOverflow', false);
    
    //mqtt_connected = false;
    function check_if_message_sent_byself(message) {
      if (Meteor.userId() && message && message.form && message.form.id) {
        return message.form.id === Meteor.userId();
      }
      return false;
    }

    initMQTT = function (clientId) {
      // 初始化MQTT时，检查queue队列是否超过emq的queue_len配置，当前配置是2000
      Meteor.call('getMqttSessionInfo', Meteor.userId(), function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
  
        if (result && result['mqueue_len'] > 1999) {
          Session.set('offlineMsgOverflow', true);
        }
      });

      if (mqtt.host) {
        console.log('already inited');
        //if(!connected){
        mqtt.disconnect(function () {
          setTimeout(function () {
            mqtt.connect();
          }, 1 * 1000);
        });
        //}
        return;
      }

      var mqttOptions = {
        username: clientId,
        password: localStorage.getItem('Meteor.loginToken'),
        host: 'mq.tiegushi.com',
        port: 8080,
        timeout: 30,
        keepAlive: 10,
        cleanSession: false,
        qos: 1,
        clientId: clientId
      };
      //mqtt_connection=new Paho.MQTT.Client('mq.tiegushi.com', Number(80), clientId);

      //if(mqtt.isOnline()){
      //  console.log('mqtt is already connected, skip mqtt init')
      //} else {
      mqtt.init(mqttOptions);
      //}
      //mqtt_connection.onConnectionLost = onConnectionLost;
      //mqtt_connection.onMessageArrived = onMessageArrived;
      //mqtt_connection.onMessageDelivered = onMessageDelivered;
      mqtt.on('init', function (re) {
        //mqtt.disconnect(function(){
        // double call of connect will cause app crash, just disconnect then connect
        //});
      }, function () {
        console.log('init failed');
      });

      setTimeout(function () {
        mqtt.connect();
      }, 1 * 1000);

      mqtt.on('connect', onConnect, onFailure);
      /*mqtt.on('publish', onMessageDelivered,function(errorMessage){
          console.log('publish failed, ', errorMessage)
        })*/
      mqtt.on('message', onMessageArrived);

      function clearUndeliveredMessages() {
        console.log('clearUndeliveredMessages: undeliveredMessages.length=' + undeliveredMessages.length);
        while (undeliveredMessages.length > 0) {
          console.log('undeliveredMessages.length=' + undeliveredMessages.length);
          var undeliveredMessage = undeliveredMessages.shift();
          var topic = undeliveredMessage.topic;
          var message = undeliveredMessage.message;
          var onMessageDeliveredCallback = undeliveredMessage.onMessageDeliveredCallback;
          addToUnsendMessaages(topic, message, onMessageDeliveredCallback, 10 * 1000);
        }
      }

      function onConnect(conact) {
        // Once a connection has been made, make a subscription and send a message.
        console.log('mqtt onConnect');
        connected = true;
        // get MQTT_TIME_DIFF
        // TODO: 跨域问题跨域问题导致该段代码无效，后期需要处理
        // var url = 'http://' + server_domain_name + '/restapi/date/';
        // $.get(url, function (data) {
        //   if (data) {
        //     MQTT_TIME_DIFF = Number(data) - Date.now();
        //     console.log('MQTT_TIME_DIFF===', MQTT_TIME_DIFF);
        //   }
        // });
        console.log('Connected to mqtt server');

        noMessageTimer = Meteor.setTimeout(function () {
          console.log('no message to receive');
          Session.set('history_message', false);
        }, 2 * 1000);
        //mqtt_connection.subscribe('workai');
        subscribeMyChatGroups();
        subscribeMqttUser(Meteor.userId());

        setTimeout(function () {
          console.log('sendMqttMessage /presence');
          sendMqttMessage('/presence/' + Meteor.userId(), {
            online: true
          });
        }, 20 * 1000);
      }

      function onFailure() {
        console.log('mqtt onFailure: errorCode=');
        connected = false;
        clearUndeliveredMessages();
        setTimeout(function () {
          //console.log('MQTT onFailure, reconnecting...');
          //mqtt_connection.connect(pahoMqttOptions);
          initMQTT();
        }, 5 * 1000);
      }

      function onMessageArrived(message) {
        if (!isJSON(message)) {
          message = JSON.parse(message);
        }
        console.log('onMessageArrived:' + message.message);
        console.log('message.destinationName= ' + message.topic);
        //console.log('message= ', msgKey, JSON.stringify(message));
        var history = Session.get('history_message');
        var msgKey = null;
        var mqttCallback = null;
        try {
          var messageObj = JSON.parse(message.message);
          if (check_if_message_sent_byself(messageObj)) {
            console.log('self sent message from broker');
            onMessageDelivered(message);
            return;
          }
        } catch (e) {
          console.log('exception by JSON.parsh and check_if_message_sent_byself ', e);
        }
        if (noMessageTimer) {
          Meteor.clearTimeout(noMessageTimer);
          noMessageTimer = null;
        }
        /*if(history && len == 0){
                console.log('sync finish');
                Session.set('history_message',false);
            }*/
        function reciveMsg(message, msgKey) {
          try {
            var topic = message.topic;
            console.log('on mqtt message topic: ' + topic + ', message: ' + message.message);
            if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/')) {
              SimpleChat.onMqttMessage(topic, message.message, msgKey, mqttCallback);
              var isTesting = Session.get('isStarting');
              if (isTesting && (topic == '/msg/g/' + isTesting.group_id) && isTesting.isTesting) {
                GroupInstallTest(message.message);
              }
            } else if (topic.startsWith('/msg/l/'))
              SimpleChat.onMqttLabelMessage(topic, message.message, msgKey, mqttCallback);
          } catch (ex) {
            console.log('exception onMqttMessage: ' + ex);
          }
        }

        if (Session.equals('GroupUsersLoaded', true)) {
          setImmediateWrap(function () {
            reciveMsg(message, msgKey);
          });
        } else {
          console.log('subscribe get my group!');
          uninsertMessages.push(message);
          uninsertMessages_msgKey.push(msgKey);
          /**
           * TODO: 该处订阅影响首页打开速度(一定要等到mqtt连接成功才能订阅到groupuser数据)，
           * 该处方法暂时保留，首页数据直接在首页订阅
           */
          Meteor.subscribe('get-my-group', Meteor.userId(), {
            onReady: function () {
              Session.set('GroupUsersLoaded', true);
              console.log('GroupUsersLoaded!!');
              if (uninsertMessages.length > 0) {
                for (var i = 0; i < uninsertMessages.length; i++) {
                  reciveMsg(uninsertMessages[i], uninsertMessages_msgKey[i]);
                }
                uninsertMessages = [];
                uninsertMessages_msgKey = [];
              }
            }
          });
        }
      }

      function onMessageDelivered(message) {
        try {
          if (!isJSON(message)) {
            message = JSON.parse(message);
          }
          var messageObj = JSON.parse(message.message);
          console.log('MQTT onMessageDelivered: "' + messageObj + '" delivered');
          var msgId = messageObj.msgId;
          // for (var i = 0; i < undeliveredMessages.length; i++) {
          //   console.log(i + ': ' + JSON.stringify(undeliveredMessages[i]));
          // }
          for (var i = 0; i < undeliveredMessages.length; i++) {
            console.log(i + ': ' + JSON.stringify(undeliveredMessages[i]));
            var undeliveredMessage = undeliveredMessages[i];
            if (undeliveredMessage && undeliveredMessage.message && (undeliveredMessage.message.msgId == msgId)) {
              console.log('Found message in undeliveredMessages!');
              if (undeliveredMessage.message) {
                console.log('Shift undeliveredMessage: ' + JSON.stringify(undeliveredMessage.message));
              }
              if (undeliveredMessage.onMessageDeliveredCallback) {
                console.log('onMessageDelivered: Call calback');
                undeliveredMessage.onMessageDeliveredCallback(null, message.message);
              }
              undeliveredMessages.splice(i, 1);
              break;
            }
          }
        } catch (error) {
          console.log('JSON parse failed. Message should be a JSON string.');
        }
      }

      function addToUnsendMessaages(topic, message, callback, timeout) {
        var id;
        if (typeof Mongo != 'undefined') {
          id = (new Mongo.ObjectID())._str;
        } else {
          var dt = new Date();
          var str = (dt.getTime() + dt.getMilliseconds() + Math.random() * 1000).toString();
          id = MD5(str);
        }
        var timeoutTimer = setTimeout(function () {
          for (var i = 0; i < unsendMessages.length; i++) {
            if (unsendMessages[i].id == id) {
              console.log('unsendMessages timeout: message=' + JSON.stringify(unsendMessages[i].message));
              callback && callback('failed', JSON.stringify(message));
              unsendMessages.splice(i, 1);
              return;
            }
          }
        }, timeout ? timeout : 15 * 1000);

        var unsendMsg = {
          id: id,
          topic: topic,
          message: message,
          callback: callback,
          timer: timeoutTimer
        };
        unsendMessages.push(unsendMsg);
        console.log('unsendMessages push: message=' + JSON.stringify(message));
      }

      var conn_time = new Date().getTime();
      var onMessageOld = function (topic, message) {
        var cur_time = new Date().getTime();
        if (cur_time - conn_time > 3000) {
          try {
            console.log('on mqtt message topic: ' + topic + ', message: ' + message);
            if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
              SimpleChat.onMqttMessage(topic, message);
            else if (topic.startsWith('/msg/l/'))
              SimpleChat.onMqttLabelMessage(topic, message);
          } catch (ex) {
            console.log('exception onMqttMessage: ' + ex);
          }
        } else {
          Meteor.setTimeout(function () {
            try {
              console.log('on mqtt message topic: ' + topic + ', message: ' + message);
              if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
                SimpleChat.onMqttMessage(topic, message);
              else if (topic.startsWith('/msg/l/'))
                SimpleChat.onMqttLabelMessage(topic, message);
            } catch (ex) {
              console.log('exception onMqttMessage: ' + ex);
            }
          }, 3000);
        }
      };

      sendMqttMessage = function (topic, message, callback) {
        var msgId;

        if (typeof Mongo != 'undefined') {
          msgId = (new Mongo.ObjectID())._str;
        } else {
          var dt = new Date();
          var str = (dt.getTime() + dt.getMilliseconds() + Math.random() * 1000).toString();
          msgId = MD5(str);
        }

        if (isJSON(message)) {
          var newMessage = {};
          newMessage.msgId = msgId;
          for (var key in message) { // Looping through all values of the old object
            newMessage[key] = message[key];
          }
          message = newMessage;
        }

        undeliveredMessages.push({
          topic: topic,
          message: message,
          onMessageDeliveredCallback: callback
        });

        console.log('sendMqttMessage:', topic, JSON.stringify(message));

        mqtt.publish({
          topic: topic,
          message: JSON.stringify(message),
          qos: 1
        }, function (sentMsg) {
          console.log('publish succ, ', sentMsg);
        }, function (err) {
          console.log('publish failed ', err);
        });
        return;

        //addToUnsendMessaages(topic, message, callback);
      };

      subscribeMqttGroup = function (group_id) {
        if (group_id) {
          console.log('sub mqtt:' + group_id);
          mqtt.subscribe({
            topic: '/msg/g/' + group_id,
            qos: 1
          });
          mqtt.subscribe({
            topic: '/msg/l/' + group_id,
            qos: 1
          }); // label 消息
        }
      };

      unsubscribeMqttGroup = function (group_id) {
        if (mqtt) {
          if (group_id) {
            mqtt.unsubscribe({
              topic: '/msg/g/' + group_id
            });
            mqtt.unsubscribe({
              topic: '/msg/l/' + group_id
            });
          }
        }
      };

      subscribeMqttUser = function (user_id) {
        if (mqtt && user_id) {
          console.log('sub mqtt:' + user_id);
          mqtt.subscribe({
            topic: '/msg/u/' + user_id,
            qos: 1
          });
        }
      };

      unsubscribeMqttUser = function (user_id) {
        if (mqtt && user_id) {
          mqtt.unsubscribe({
            topic: '/msg/u/' + user_id
          });
        }
      };

      sendMqttGroupMessage = function (group_id, message, callback) {
        message.create_time = new Date(Date.now() + MQTT_TIME_DIFF);
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
          console.log('>>> this is admin, send group message to myself');
          onMessageOld('/msg/g/' + group_id, JSON.stringify(message), callback);
        } else {
          sendMqttMessage('/msg/g/' + group_id, message, callback);
        }
      };

      sendMqttUserMessage = function (user_id, message, callback) {
        // console.log('sendMqttUserMessage:', message);
        sendMqttMessage('/msg/u/' + user_id, message, callback);
      };

      sendMqttGroupLabelMessage = function (group_id, message, callback) {
        message.create_time = new Date(Date.now() + MQTT_TIME_DIFF);
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
          console.log('>>> this is admin, send label message to myself');
          onMessageOld('/msg/l/' + group_id, JSON.stringify(message));
          console.log('====sraita====' + JSON.stringify(message));
          if (message.is_admin_relay) {
            sendMqttMessage('/msg/l/' + group_id, JSON.stringify(message), callback);
          }
        } else {
          sendMqttMessage('/msg/l/' + group_id, message, callback);
        }
      };
    };

    MQTTDisconnect = function (cb) {
      try {
        mqtt.disconnect(cb);
        connected = false;
      } catch (error) {
        console.log(error);
        cb && cb();
      }
    };

    subscribeMyChatGroups = function () {
      /**
       * TODO: 该处订阅影响首页打开速度(一定要等到mqtt连接成功才能订阅到groupuser数据)，
       * 该处方法暂时保留，首页数据直接在首页订阅
       */
      Meteor.subscribe('get-my-group', Meteor.userId(), {
        onReady: function () {
          Session.set('GroupUsersLoaded', true);
        }
      });

      SimpleChat.GroupUsers.find({
        user_id: Meteor.userId()
      }).observe({
        added: function (document) {
          subscribeMqttGroup(document.group_id);
        },
        changed: function (newDocument, oldDocument) {
          if (oldDocument.group_id === newDocument.group_id)
            return;

          unsubscribeMqttGroup(oldDocument.group_id);
          subscribeMqttGroup(newDocument.group_id);
        },
        removed: function (document) {
          unsubscribeMqttGroup(document.group_id);
        }
      });
    };

    getMqttClientID = function () {
      var client_id = window.localStorage.getItem('mqtt_client_id');
      if (!client_id) {
        client_id = 'WorkAIC_' + (new Mongo.ObjectID())._str;
        window.localStorage.setItem('mqtt_client_id', client_id);
      }
      console.log('##RDBG getMqttClientID: ' + client_id);
      return client_id;
    };

    function startMQTT() {
      if (SimpleChat.checkMsgSessionLoaded()) {
        console.log('GroundDB all loaded!');
        initMQTT(Meteor.userId());
      } else {
        console.log('Waiting for loading GroundDB...');
        if (init_timer) {
          clearTimeout(init_timer);
          init_timer = null;
        }
        init_timer = setTimeout(function () {
          startMQTT();
        }, 500);
      }
    }

    mqttEventResume = function () {
      console.log('##RDBG, mqttEventResume, reestablish mqtt connection');
      setTimeout(function () {
        if (Meteor.userId()) {
          startMQTT();
        }
      }, 1000);
      /*try {
        if (mqtt_connection) {
          console.log('try reconnect mqtt');
          mqtt_connection._reconnect();
        }
      }
      catch (ex) { console.log('mqtt reconnect ex=', ex); }*/
    };

    mqttEventPause = function () {
      console.log('##RDBG, mqttEventPause, disconnect mqtt');
      MQTTDisconnect();
    };

    Deps.autorun(function () {
      if (Meteor.userId()) {
        startMQTT();
      } else {
        MQTTDisconnect();
      }
    });

    document.addEventListener('offline', function () {
      console.log('device get offline');
      MQTTDisconnect();
      network_status = navigator.connection.type;
    }, false);

    document.addEventListener('online', function () {
      console.log('device get online');
      //startMQTT()
      if (network_status !== navigator.connection.type) {
        MQTTDisconnect(function () {
          network_status = navigator.connection.type;
          startMQTT();
        });
      }
    }, false);
  });
}