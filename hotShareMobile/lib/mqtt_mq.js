/**
 * Created by simba on 5/12/16.
 */

if(Meteor.isClient){
    Meteor.startup(function(){
        mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80');
        mqtt_connection.on('connect',function(){

            console.log('Connected to mqtt server');
            mqtt_connection.subscribe('workai');
            mqtt_connection.on('message', function(topic, message) {
              console.log('on mqtt message topic: ' + topic + ', message: ' + message.toString());
              if (topic == 'workai') {
                console.log('workai message: ' + message.toString());
                SimpleChat.onMqttMessage(message.toString());
              }
            });
        });
        sendMqttMessage=function(topic,message){
            Meteor.defer(function(){
                mqtt_connection.publish(topic,JSON.stringify(message),{qos:2})
            })
        }

    })
}
