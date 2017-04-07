/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isClient){
    mqtt_connection = null;
    initMQTT = function(clientId){
        var mqttOptions = {
            clean:false,
            keepalive:30,
            reconnectPeriod:20*1000,
            clientId:clientId
        }
        mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80');
        mqtt_connection.on('connect',function(){
            console.log('Connected to mqtt server');
            //mqtt_connection.subscribe('workai');
            subscribeMyChatGroups();
            mqtt_connection.on('message', function(topic, message) {
                console.log('on mqtt message topic: ' + topic + ', message: ' + message.toString());
                SimpleChat.onMqttMessage(topic, message.toString());
            });
        });
        sendMqttMessage=function(topic,message){
            Meteor.defer(function(){
                console.log('sendMqttMessage:', topic, message);
                mqtt_connection.publish(topic,JSON.stringify(message),{qos:2})
            })
        };
        subscribeMqttGroup=function(group_id) {
          if (mqtt_connection) {
            console.log('sub mqtt:' + group_id);
            mqtt_connection.subscribe("/msg/g/" + group_id);
          }
        };
        unsubscribeMqttGroup=function(group_id) {
          if (mqtt_connection) {
            mqtt_connection.unsubscribe("/msg/g/" + group_id);
          }
        };
        subscribeMqttUser=function(user_id){
          if (mqtt_connection) {
            console.log('sub mqtt:', user_id);
            mqtt_connection.subscribe("/msg/u/" + user_id);
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
    }
    uninitMQTT = function() {
      try {
          if (mqtt_connection) {
              mqtt_connection.end();
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
    Deps.autorun(function(){
        if(Meteor.userId()){
            Meteor.setTimeout(function(){
                initMQTT(Meteor.userId());
                subscribeMyChatGroups();
                subscribeMqttUser(Meteor.userId());
            },1000)
        } else {
            uninitMQTT()
        }
    });
}
