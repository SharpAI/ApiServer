/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isClient && !withNativeMQTTLIB){
    var myMqtt = Paho.MQTT;
    var undeliveredMessages = [];
    var unsendMessages = [];
    var uninsertMessages = [];
    var uninsertMessages_msgKey = [];
    var init_timer = null;
    mqtt_connection = null;
    Session.set('history_message',false);
    var noMessageTimer = null;

    //mqtt_connected = false;
    var onMessageArrived = function(message, msgKey,len, mqttCallback) {
        console.log("onMessageArrived:"+message.payloadString);
        console.log('message.destinationName= '+message.destinationName);
        console.log('message= ', msgKey, JSON.stringify(message));
        var history = Session.get('history_message');
        if(noMessageTimer){
            Meteor.clearTimeout(noMessageTimer);
            noMessageTimer = null;
        }
        if(history && len == 0){
            console.log('sync finish');
            Session.set('history_message',false);
        }
        function reciveMsg(message, msgKey){
            try {
                var topic = message.destinationName;
                console.log('on mqtt message topic: ' + topic + ', message: ' + message.payloadString);
                if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
                {
                    SimpleChat.onMqttMessage(topic, message.payloadString, msgKey, mqttCallback);
                    var isTesting = Session.get('isStarting');
                    if(isTesting && (topic == '/msg/g/'+isTesting.group_id) && isTesting.isTesting){
                        GroupInstallTest(message.payloadString);
                    }
                }
                else if (topic.startsWith('/msg/l/'))
                    SimpleChat.onMqttLabelMessage(topic, message.payloadString, msgKey, mqttCallback);
            } catch (ex) {
                console.log('exception onMqttMessage: ' + ex);
            }
        }
        if (Session.equals('GroupUsersLoaded',true)) {
            setImmediateWrap(function() {
                reciveMsg(message, msgKey);
            });
        }
        else{
            console.log('subscribe get my group!');
            uninsertMessages.push(message);
            uninsertMessages_msgKey.push(msgKey)
            Meteor.subscribe('get-my-group', Meteor.userId(),{
                onReady:function(){
                    Session.set('GroupUsersLoaded',true);
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
    };
    initMQTT = function(clientId){
        if(!mqtt_connection){
            var pahoMqttOptions = {
                timeout: 30,
                keepAliveInterval:60,
                cleanSession: false,
                onSuccess:onConnect,
                onFailure:onFailure,
                reconnect: true
            };
            //mqtt_connection=myMqtt.connect('ws://tmq.tiegushi.com:80',mqttOptions);
            mqtt_connection=new Paho.MQTT.Client('mq.tiegushi.com', Number(80), clientId);
            //mqtt_connection=new Paho.MQTT.Client('183.136.238.174', Number(8083), clientId);
            mqtt_connection.onConnectionLost = onConnectionLost;
            mqtt_connection.onMessageArrived = onMessageArrived;
            mqtt_connection.onMessageDelivered = onMessageDelivered;
            mqtt_connection.connect(pahoMqttOptions);
            function clearUndeliveredMessages() {
                console.log('clearUndeliveredMessages: undeliveredMessages.length='+undeliveredMessages.length);
                while (undeliveredMessages.length > 0) {
                    console.log('undeliveredMessages.length='+undeliveredMessages.length);
                    var undeliveredMessage = undeliveredMessages.shift();
                    var topic = undeliveredMessage.topic;
                    var message = undeliveredMessage.message;
                    var onMessageDeliveredCallback = undeliveredMessage.onMessageDeliveredCallback;
                    addToUnsendMessaages(topic, message, onMessageDeliveredCallback, 10*1000);
                }
            };

            function onConnect() {
                // Once a connection has been made, make a subscription and send a message.
                console.log("mqtt onConnect");
                // get MQTT_TIME_DIFF
                var url = 'http://'+server_domain_name+'/restapi/date/';
                $.get(url,function(data){
                    if(data){
                        MQTT_TIME_DIFF = Number(data) - Date.now();
                        console.log('MQTT_TIME_DIFF===',MQTT_TIME_DIFF)
                    }
                });
                console.log('Connected to mqtt server');
                noMessageTimer = Meteor.setTimeout(function(){
                    console.log('no message to receive');
                    Session.set('history_message',false);
                },2*1000);
                //mqtt_connection.subscribe('workai');
                subscribeMyChatGroups();
                subscribeMqttUser(Meteor.userId());

                setTimeout(function(){
                    console.log("sendMqttMessage /presence")
                    sendMqttMessage('/presence/'+Meteor.userId(),{online:true})
                    // if (unsendMessages.length > 0) {
                    //     var unsendMsg;
                    //     var fifo = unsendMessages.reverse();
                    //     // Send all queued messages down socket connection
                    //     console.log('onConnect: Send all unsendMessages message: '+unsendMessages.length);
                    //     var len = unsendMessages.length
                    //     var i = 0;
                    //     while ((unsendMsg = fifo.pop())) {
                    //         var topic = unsendMsg.topic;
                    //         var message = unsendMsg.message;
                    //         var callback = unsendMsg.callback;
                    //         var timeoutTimer = unsendMsg.timer;
                    //         clearTimeout(timeoutTimer);
                    //         timeoutTimer = null;
                    //         sendMqttMessage(topic, message, callback);
                    //         console.log('unsendMessages send message='+JSON.stringify(message));
                    //         i++
                    //         if (i >= len){
                    //             break;
                    //         }
                    //     }
                    // }
                }, 20*1000)
            };
            function onFailure(msg) {
                console.log('mqtt onFailure: errorCode='+msg.errorCode);
                clearUndeliveredMessages();
                // setTimeout(function(){
                    console.log('MQTT onFailure, reconnecting...');
                    mqtt_connection.connect(pahoMqttOptions);
                // }, 1000);
            };
            function onConnectionLost(responseObject) {
                //mqtt_connected = false;
                console.log('MQTT connection lost.')
                clearUndeliveredMessages();
                if (responseObject.errorCode !== 0) {
                    console.log("onConnectionLost: "+responseObject.errorMessage);
                }
                // setTimeout(function(){
                    console.log('MQTT onConnectionLost, reconnecting...');
                    mqtt_connection.connect(pahoMqttOptions);
                // }, 1000);
            };
            function onMessageDelivered(message) {
                console.log('MQTT onMessageDelivered: "' + message.payloadString + '" delivered');
                try {
                    var messageObj = JSON.parse(message.payloadString);
                    var msgId = messageObj.msgId;
                    for (var i=0; i<undeliveredMessages.length; i++) {
                        console.log(i+': '+JSON.stringify(undeliveredMessages[i]));
                    }
                    for (var i=0; i<undeliveredMessages.length; i++) {
                        var undeliveredMessage = undeliveredMessages[i];
                        if (undeliveredMessage && undeliveredMessage.message && (undeliveredMessage.message.msgId == msgId)) {
                            console.log('Found message in undeliveredMessages!');
                            if (undeliveredMessage.message) {
                                console.log('Shift undeliveredMessage: '+JSON.stringify(undeliveredMessage.message));
                            }
                            if (undeliveredMessage.onMessageDeliveredCallback) {
                                console.log('onMessageDelivered: Call calback');
                                undeliveredMessage.onMessageDeliveredCallback(null, message.payloadString);
                            }
                            undeliveredMessages.splice(i, 1);
                            break;
                        }
                    }
                } catch (error) {
                    console.log('JSON parse failed. Message should be a JSON string.');
                }
            }
            function addToUnsendMessaages(topic,message,callback, timeout) {
                var id;
                if (typeof Mongo != 'undefined') {
                    id = (new Mongo.ObjectID())._str;
                } else {
                    var dt = new Date();
                    var str = (dt.getTime()+dt.getMilliseconds()+Math.random()*1000).toString();
                    id = MD5(str);
                }
                var timeoutTimer = setTimeout(function() {
                    for (var i=0; i<unsendMessages.length; i++) {
                        if (unsendMessages[i].id == id) {
                            console.log('unsendMessages timeout: message='+JSON.stringify(unsendMessages[i].message));
                            callback && callback('failed', JSON.stringify(message));
                            unsendMessages.splice(i, 1);
                            return;
                        }
                    }
                }, timeout?timeout:15*1000);

                var unsendMsg = {
                    id: id,
                    topic: topic,
                    message: message,
                    callback: callback,
                    timer: timeoutTimer
                };
                unsendMessages.push(unsendMsg);
                console.log('unsendMessages push: message='+JSON.stringify(message));
            }
            function isJSON(message) {
                if(typeof(message) == "object" &&
                    Object.prototype.toString.call(message).toLowerCase() == "[object object]" && !message.length){
                    return true;
                } else {
                    return false;
                }
            }

            var conn_time = new Date().getTime();
            var onMessageOld = function(topic, message){
                var cur_time = new Date().getTime();
                if (cur_time - conn_time > 3000) {
                    try {
                    console.log('on mqtt message topic: ' + topic + ', message: ' + message);
                    if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
                        SimpleChat.onMqttMessage(topic, message);
                    else if (topic.startsWith('/msg/l/'))
                        SimpleChat.onMqttLabelMessage(topic, message);
                    }
                    catch (ex) {
                    console.log('exception onMqttMessage: ' + ex);
                    }
                }
                else {
                    Meteor.setTimeout(function() {
                    try {
                        console.log('on mqtt message topic: ' + topic + ', message: ' + message);
                        if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
                        SimpleChat.onMqttMessage(topic, message);
                        else if (topic.startsWith('/msg/l/'))
                        SimpleChat.onMqttLabelMessage(topic, message);
                    }
                    catch (ex) {
                        console.log('exception onMqttMessage: ' + ex);
                    }
                    }, 3000);
                }
            };

            sendMqttMessage=function(topic,message,callback){
                var msgId;

                if (typeof Mongo != 'undefined') {
                    msgId = (new Mongo.ObjectID())._str;
                } else {
                    var dt = new Date();
                    var str = (dt.getTime()+dt.getMilliseconds()+Math.random()*1000).toString();
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

                if (mqtt_connection.isConnected()) {
                    undeliveredMessages.push({
                        topic: topic,
                        message: message,
                        onMessageDeliveredCallback: callback
                    });
                    console.log('sendMqttMessage:', topic, JSON.stringify(message));
                    mqtt_connection.send(topic, JSON.stringify(message), 1);
                    return ;
                }

                addToUnsendMessaages(topic, message, callback);
            };
            subscribeMqttGroup=function(group_id) {
                if (mqtt_connection && group_id) {
                    console.log('sub mqtt:' + group_id);
                    mqtt_connection.subscribe('/msg/g/'+group_id,{qos:1, onSuccess:onSuccess, onFailure:onFailure});
                    mqtt_connection.subscribe('/msg/l/'+group_id,{qos:1, onSuccess:onSuccess, onFailure:onFailure}); // label 消息
                    function onSuccess() {
                        console.log('mqtt subscribe group msg successfully.');
                    }
                    function onFailure() {
                        console.log('mqtt subscribe group msg failed.');
                    }
                }
            };
            unsubscribeMqttGroup=function(group_id) {
                if (mqtt_connection) {
                    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
                        mqtt_connection.unsubscribe("/msg/g/#");
                        mqtt_connection.unsubscribe("/msg/l/#");
                    }
                    else if (group_id) {}{
                        mqtt_connection.unsubscribe("/msg/g/" + group_id);
                        mqtt_connection.unsubscribe("/msg/l/" + group_id);
                    }
                }
            };
            subscribeMqttUser=function(user_id){
                if (mqtt_connection && user_id) {
                    console.log('sub mqtt:' + user_id);
                    mqtt_connection.subscribe('/msg/u/'+user_id,{qos:1, onSuccess:onSuccess, onFailure:onFailure});
                    function onSuccess() {
                        console.log('mqtt subscribe user msg successfully.');
                    }
                    function onFailure() {
                        console.log('mqtt subscribe user msg failed.');
                    }
                }
            };
            unsubscribeMqttUser=function(user_id){
                if (mqtt_connection && user_id) {
                    mqtt_connection.unsubscribe("/msg/u/" + user_id);
                }
            };
            // sendMqttMessage=function(topic,message){
            //     Meteor.defer(function(){
            //         mqtt_connection.publish(topic,JSON.stringify(message),{qos:2})
            //     })
            // };
            sendMqttGroupMessage=function(group_id, message,callback) {
                message.create_time = new Date(Date.now() + MQTT_TIME_DIFF);
                if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
                    console.log('>>> this is admin, send group message to myself')
                    onMessageOld("/msg/g/" + group_id, JSON.stringify(message),callback);
                }
                else {
                    sendMqttMessage("/msg/g/" + group_id, message,callback);
                }
            };
            sendMqttUserMessage=function(user_id, message,callback) {
                // console.log('sendMqttUserMessage:', message);
                sendMqttMessage("/msg/u/" + user_id, message,callback);
            };
            sendMqttGroupLabelMessage=function(group_id, message,callback) {
                message.create_time = new Date(Date.now() + MQTT_TIME_DIFF);
                if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
                    console.log('>>> this is admin, send label message to myself')
                    onMessageOld("/msg/l/" + group_id, JSON.stringify(message));
                    console.log('====sraita===='+JSON.stringify(message));
                    if(message.is_admin_relay){
                        sendMqttMessage("/msg/l/" + group_id, JSON.stringify(message),callback);
                    }
                }
                else {
                    sendMqttMessage("/msg/l/" + group_id, message,callback);
                }
            };
        }
    }
    uninitMQTT = function() {
      try {
          if (mqtt_connection) {
              mqtt_connection.disconnect();
              //mqtt_connected = false;
              mqtt_connection = null;
          }
      } catch (error) {
        console.log(error)
      }
    }
    subscribeMyChatGroups = function() {
      Meteor.subscribe('get-my-group', Meteor.userId(),{
        onReady:function(){
            Session.set('GroupUsersLoaded',true);
        }
      });

      if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType == 'admin') {
          if (mqtt_connection) {
              console.log('sub all groups mqtt');
              mqtt_connection.subscribe('/msg/g/#', {qos:1, onSuccess:onSuccess, onFailure:onFailure});
              mqtt_connection.subscribe('/msg/l/#', {qos:1, onSuccess:onSuccess, onFailure:onFailure}); // label 消息
              function onSuccess() {
                  console.log('mqtt subscribe group msg successfully.');
              }
              function onFailure() {
                  console.log('mqtt subscribe group msg failed.');
              }
          }
      }
      else {
          SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).observe({
             added: function(document) {
                subscribeMqttGroup(document.group_id);
             },
             changed: function(newDocument, oldDocument){
               if (oldDocument.group_id === newDocument.group_id)
                 return;

               unsubscribeMqttGroup(oldDocument.group_id);
               subscribeMqttGroup(newDocument.group_id);
             },
             removed: function(document){
               unsubscribeMqttGroup(document.group_id);
             }
          });
      }
    }
    getMqttClientID = function() {
      var client_id = window.localStorage.getItem('mqtt_client_id');
      if (!client_id) {
        client_id = 'WorkAIC_' + (new Mongo.ObjectID())._str;
        window.localStorage.setItem('mqtt_client_id', client_id);
      }
      console.log("##RDBG getMqttClientID: " + client_id);
      return client_id;
    };
    function startMQTT() {
        if (SimpleChat.checkMsgSessionLoaded()) {
            console.log("GroundDB all loaded!");
            initMQTT(Meteor.userId());
        } else {
            console.log("Waiting for loading GroundDB...");
            if (init_timer) {
                clearTimeout(init_timer);
                init_timer = null;
            }
            init_timer = setTimeout(function(){
                startMQTT();
            },500);
        }
    }
    mqttEventResume = function() {
      console.log('##RDBG, mqttEventResume, reestablish mqtt connection');
      setTimeout(function() {
        if(Meteor.userId()){
          //initMQTT(getMqttClientID());
          //initMQTT(Meteor.userId());
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
    mqttEventPause = function() {
      console.log('##RDBG, mqttEventPause, disconnect mqtt');
      uninitMQTT();
    };
    Deps.autorun(function(){
        if(Meteor.userId()){
            startMQTT();
        } else {
            uninitMQTT();
        }
    });
}
