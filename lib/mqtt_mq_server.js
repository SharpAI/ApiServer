/**
 * Created by simba on 5/12/16.
 */
if(Meteor.isServer){
    sendMqttUserMessage = null;
    sendMqttGroupMessage= null;

    initMQTT = function(clientId){
        var mqttOptions = {
            clean:true,
            keepalive:30,
            reconnectPeriod:20*1000,
            clientId:clientId
        }
        mqtt_connection=mqtt.connect(mqttURL,mqttOptions);
        mqtt_connection.on('connect',function(){
            console.log('Connected to mqtt server');
        });
        mqtt_connection.on('message', function (topic, message) {
            // message is Buffer
            var keyword = '/msg/autogroup/';
            if (topic.indexOf(keyword) == 0) {
                var group_id = topic.substring(keyword.length);
                console.log("/msg/autogroup/: "+group_id+", message="+message.toString());
                //results.append({"opt":'mv', "url":url, "from_faceId":from_faceId, "to_faceId":to_faceId})
                CLUSTER_PERSON.updateAutogroupResult(group_id, message);
            }
        });
        mqtt_connection.subscribe('/msg/autogroup/#');
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
        sendMqttUserMessage=function(user_id, message) {
            // console.log('sendMqttUserMessage:', message);
            sendMqttMessage("/msg/u/" + user_id, message);
        };
        sendMqttGroupMessage=function(group_id, message) {
            sendMqttMessage("/msg/g/" + group_id, message);
        };
    }


    Meteor.startup(function(){
        initMQTT(null);
    })
}
