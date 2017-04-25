/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isClient){
    mqtt_connection = null;
    mqtt_connected = false;
    initMQTT = function(clientId){
        if(!mqtt_connection){
            var mqttOptions = {
                clean:false,
                keepalive:20,
                reconnectPeriod:10*1000,
                /*incomingStore: mqtt_store_manager.incoming,
                outgoingStore: mqtt_store_manager.outgoing,*/
                clientId:clientId
            }
            mqtt_connection=mqtt.connect('ws://mq.tiegushi.com:80',mqttOptions);
            mqtt_connection.on('connect',function(){
                if(!mqtt_connected){
                    mqtt_connected = true;
                    console.log('Connected to mqtt server');
                    //mqtt_connection.subscribe('workai');
                    subscribeMyChatGroups();
                    subscribeMqttUser(Meteor.userId());
                    sendMqttMessage('/presence/'+Meteor.userId(),{online:true});
                }
            });

            mqtt_connection.on('message', function(topic, message) {
              Meteor.setTimeout(function() {
                try {
                  console.log('on mqtt message topic: ' + topic + ', message: ' + message.toString());
                  if (topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/'))
                    SimpleChat.onMqttMessage(topic, message.toString());
                  else if (topic.startsWith('/msg/l/'))
                    SimpleChat.onMqttLabelMessage(topic, message.toString());
                }
                catch (ex) {
                  console.log('exception onMqttMessage: ' + ex);
                }
              }, 1500);
            });
            sendMqttMessage=function(topic,message){
                console.log('sendMqttMessage:', topic, message);
                mqtt_connection.publish(topic,JSON.stringify(message),{qos:1})
            };
            subscribeMqttGroup=function(group_id) {
                if (mqtt_connection) {
                    console.log('mqtt.subscribe:' + '/msg/g/'+group_id);
                    console.log('mqtt.subscribe:' + '/msg/l/'+group_id);
                    mqtt_connection.subscribe('/msg/g/'+group_id,{qos:1});
                    mqtt_connection.subscribe('/msg/l/'+group_id,{qos:1}); // label 消息
                }
            };
            unsubscribeMqttGroup=function(group_id) {
                if (mqtt_connection) {
                    mqtt_connection.unsubscribe("/msg/g/" + group_id);
                    mqtt_connection.unsubscribe("/msg/l/" + group_id);
                }
            };
            subscribeMqttUser=function(user_id){
                if (mqtt_connection) {
                    console.log('sub mqtt:' + user_id);
                    mqtt_connection.subscribe('/msg/u/'+user_id,{qos:1});
                }
            };
            unsubscribeMqttUser=function(user_id){
                if (mqtt_connection) {
                    mqtt_connection.unsubscribe("/msg/u/" + user_id);
                }
            };
            // sendMqttMessage=function(topic,message){
            //     Meteor.defer(function(){
            //         mqtt_connection.publish(topic,JSON.stringify(message),{qos:2})
            //     })
            // };
            sendMqttGroupMessage=function(group_id, message) {
                sendMqttMessage("/msg/g/" + group_id, message);
            };
            sendMqttUserMessage=function(user_id, message) {
                // console.log('sendMqttUserMessage:', message);
                sendMqttMessage("/msg/u/" + user_id, message);
            };
            sendMqttGroupLabelMessage=function(group_id, message) {
                sendMqttMessage("/msg/l/" + group_id, message);
            };
        }
    }
    uninitMQTT = function() {
      try {
          if (mqtt_connection) {
              mqtt_connection.end();
              mqtt_connected = false;
              mqtt_connection = null;
          }
      } catch (error) {
        console.log(error)
      }
    }
    subscribeMyChatGroups = function() {
      Meteor.subscribe('get-my-group', Meteor.userId(), function() {
        // userGroups = SimpleChat.GroupUsers.find({user_id: Meteor.userId()});
        // userGroups.forEach(function(userGroup) {
        //   subscribeMqttGroup(userGroup.group_id);
        // });
      });

      SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).observe({
         added: function(document) {
            subscribeMqttGroup(document.group_id);
         },
         changed: function(newDocument, oldDocument){
           unsubscribeMqttGroup(oldDocument.group_id);
           subscribeMqttGroup(newDocument.group_id);
         },
         removed: function(document){
           unsubscribeMqttGroup(document.group_id);
         }
      });
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
    mqttEventResume = function() {
      console.log('##RDBG, mqttEventResume, reestablish mqtt connection');
      Meteor.setTimeout(function() {
        if(Meteor.userId()){
          initMQTT(getMqttClientID());
        }
      }, 1000);
    };
    mqttEventPause = function() {
      console.log('##RDBG, mqttEventPause, disconnect mqtt');
      uninitMQTT();
    };
    Deps.autorun(function(){
        if(Meteor.userId()){
            Meteor.setTimeout(function(){
                initMQTT(Meteor.userId());
            },1000)
        } else {
            uninitMQTT()
        }
    });
}
