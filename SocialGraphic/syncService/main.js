/**
 * Created by simba on 5/13/16.
 */

var mqtt    = require('mqtt');
var savePostUser = require('./import-user-post-info');
var save_viewer_node = require('./import-viewer-info').save_viewer_node;
//var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');
//var client  = mqtt.connect('mqtt://broker.raidcdn.org');
var client  = mqtt.connect('ws://rpcserver.raidcdn.com:80');
//var client  = mqtt.connect('mqtt://rpcserver.raidcdn.com');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare';
//var url = 'mongodb://localhost:27017/localdb';
var db = null
process.addListener('uncaughtException', function (err) {
    var msg = err.message;
    if (err.stack) {
        msg += '\n' + err.stack;
    }
    if (!msg) {
        msg = JSON.stringify(err);
    }
    console.log(msg);
    console.trace();
});
MongoClient.connect(url, function(err, tdb) {
    assert.equal(null, err);
    db=tdb
});
client.on('connect' ,function () {
    console.log('Connected to server')
    client.subscribe('postView',{qos:2});
    client.subscribe('publishPost',{qos:2});
    client.subscribe('newUser',{qos:2});

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log(topic+': '+message.toString());
        var json = JSON.parse(message)
        if(topic === 'postView'){
            db.collection('posts').findOne({_id:json.postId},{fields:{
                browse:true,
                title:true,
                addontitle:true,
                owner:true,
                _id:true,
                ownerName:true,
                createdAt:true,
                mainImage:true
            }},function(err, post) {
                //console.log(post);
                db.collection('users').findOne({_id:json.userId},{fields:{
                    username: true,
                    createdAt:true,
                    'profile.fullname': true,
                    type: true,
                    'profile.sex':true,
                    'profile.lastLogonIP':true,
                    'profile.anonymous':true,
                    'profile.browser':true,
                    'profile.location':true
                }},function(err, user) {
                    console.log(user.profile.fullname+' -[:VIEWER]-> '+post.title);
                    savePostUser.save_user_node(user,function(){
                        savePostUser.save_post_node(post,function(){
                            console.log('Info saved')
                            json.createdAt=new Date()
                            save_viewer_node(json,function(){

                            })
                        })
                    })
                });
            });
        } else if(topic === 'newUser'){
            db.collection('users').findOne({_id:json.userId},{fields:{
                username: true,
                createdAt:true,
                'profile.fullname': true,
                type: true,
                'profile.sex':true,
                'profile.lastLogonIP':true,
                'profile.anonymous':true,
                'profile.browser':true,
                'profile.location':true
            }},function(err, user) {
                savePostUser.save_user_node(user,function(){
                    console.log('User Info saved')
                })
            });
        } else if(topic === 'publishPost'){
            db.collection('posts').findOne({_id:json.postId},{fields:{
                browse:true,
                title:true,
                addontitle:true,
                owner:true,
                _id:true,
                ownerName:true,
                createdAt:true,
                mainImage:true
            }},function(err, post) {
                savePostUser.save_post_node(post,function(){
                    console.log('Post Info saved')
                })
            });
        }
        //client.end();
    });

    //client.publish('raid_cdn_add_torrent',JSON.stringify({token:"sXrfefPZ3CSHS2Mwu",url:"http://zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4",videoLength:78396301,file_path:"/root/docker-share/sXrfefPZ3CSHS2Mwu/zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4"} ));
    // client.publish('raid_cdn_add_torrent',JSON.stringify({token:"token",url:"http://zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4",videoLength:78396301}));
});
