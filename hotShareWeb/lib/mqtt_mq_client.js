/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isClient){
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
    }
    uninitMQTT = function(){
        if(mqtt_connection){
            mqtt_connection.end()
        }
    }
    Deps.autorun(function(){
        if(Meteor.userId()){
            Meteor.setTimeout(function(){
                initMQTT(Meteor.userId())
            },1000)
        } else {
            uninitMQTT()
        }
    });
}
