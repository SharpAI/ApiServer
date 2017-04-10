/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isServer){
    initMQTT = function(clientId){
        var mqttOptions = {
            clean:true,
            keepalive:30,
            reconnectPeriod:20*1000,
            clientId:clientId
        }
        mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80',mqttOptions);
        mqtt_connection.on('connect',function(){
            console.log('Connected to mqtt server');
        });
        sendMqttMessage=function(topic,message){
            Meteor.defer(function(){
                mqtt_connection.publish(topic,JSON.stringify(message),{qos:1})
            })
        }
        mqttPostViewHook=function(userId,postId){
            try{
                sendMqttMessage('postView',{userId:userId,postId:postId})
            }catch(e){}
        }
        mqttInsertNewPostHook=function(ownerId,postId,title,addonTitle,ownerName,mainImage){
            try{
                sendMqttMessage('publishPost',{
                    ownerId:ownerId,
                    postId:postId,
                    title:title,
                    addonTitle:addonTitle,
                    ownerName:ownerName,
                    mainImage:mainImage
                })
            }catch(e){}
        }
        mqttUserCreateHook=function(userId,fullname,username){
            try{
                sendMqttMessage('newUser',{
                    userId:userId,
                    fullname:fullname,
                    username:username
                })
            }catch(e){}
        }
    }

    Meteor.startup(function(){
        initMQTT('workAI_server');
    })
}
