/**
 * Created by simba on 5/12/16.
 */

if(Meteor.isServer){
    Meteor.startup(function(){
        mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80');
        mqtt_connection.on('connect',function(){

            console.log('Connected to mqtt server');
            //mqtt_connection.publish(Session.get('postContent')._id, 'Hello u'+Session.get('postContent')._id)
        });
        sendMqttMessage=function(topic,message){
            Meteor.defer(function(){
                mqtt_connection.publish(topic,JSON.stringify(message),{qos:2})
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
    })
}