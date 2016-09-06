/**
 * Created by simba on 9/4/16.
 */
/**
 * Created by simba on 5/13/16.
 */

var mqtt    = require('mqtt');
//var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');
//var client  = mqtt.connect('mqtt://broker.raidcdn.org');
var client  = mqtt.connect('ws://rpcserver.raidcdn.com:80');
//var client  = mqtt.connect('mqtt://rpcserver.raidcdn.com');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare';
var userDBURL = 'mongodb://postevent:akak(*&654@ds019786.mlab.com:19786/postevent'
//var url = 'mongodb://localhost:27017/localdb';
var db = null
var userDB = null
var TelegramBot = require('node-telegram-bot-api');
var token = '245939457:AAE9qEYvnNv1A5hOfkkRwwxBnEU0qE6RHyE';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});


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
MongoClient.connect(userDBURL, function(err, tdb) {
    assert.equal(null, err);
    userDB=tdb
    console.log('Connected to userDB')
    update_send_list()
});

var telegram_password = '98216cka';
var send_list = [];

function add_auth_user_info_to_db (username,chat_id,callback){
    userDB.collection('auth_users').insert({username:username,chat_id:chat_id},callback);
}
function update_auth_user_info_to_db (username,chat_id,callback){
    userDB.collection('auth_users').update({username:username},{chat_id:chat_id},{upsert:true},callback);
}
function remove_auth_user_info_to_db (username,chat_id,callback){
    userDB.collection('auth_users').remove({username:username},callback);
}
function check_if_legit_user(username,callback){
    userDB.collection('auth_users').findOne({username:username},callback)
}
function get_auth_userlist(callback){
    userDB.collection('auth_users').find({}).toArray(callback);
}
function update_send_list(callback){
    userDB.collection('auth_users').find({}).toArray(function(err,userlist){
        userlist.forEach(function(item){
            if(item && item.chat_id){
                send_list.push(item.chat_id)
            }
        })
    });
}
function send_new_post_info_to_send_list(post,callback){
    if (send_list.length > 0){
        send_list.forEach(function(chat_id){
            try{
                var fromId = chat_id;
                var resp = JSON.stringify({url:'http://cdn.tiegushi.com/posts/'+json.postId,title:post.title,addonTitle:post.addontitle,
                    ownerName:post.ownerName
                });
                bot.sendMessage(fromId, resp);
            }catch(e){

            }
        })
    }
}

bot.onText(/\/start/, function (msg, match) {
    var fromId = msg.from.id;
    var fromUsername = msg.from.username;
    console.log(msg)
    var usage = '*Command list:*\n' +
        '*/auth [password]*  Add yourself to send list\n' +
        '*/remove*                Remove yourself from send list\n' +
        '*/all*                   Show all user in the send list\n';
    bot.sendMessage(fromId, usage,{parse_mode:"Markdown"});
});
bot.onText(/\/all/, function (msg, match) {
    var fromId = msg.from.id;
    var fromUsername = msg.from.username;
    check_if_legit_user(fromUsername,function(err,user){
        if(!err && user && user.username===fromUsername){
            get_auth_userlist(function(err,userlist){
                console.log(userlist)
                var resp = ''
                var count = 0
                userlist.forEach(function(item,index){
                    if(item && item.username && item.chat_id){
                        resp += item.username + '/' + item.chat_id + '  ';
                        count ++;
                    }
                })
                bot.sendMessage(fromId, resp + (count>1 ? 'are' : 'is') + ' in the send list', {parse_mode:"Markdown"});
            })
        } else {
            bot.sendMessage(fromId, 'Please run /auth [password] first.',{parse_mode:"Markdown"});
        }
    });
});
bot.onText(/\/remove/, function (msg, match) {
    var fromId = msg.from.id;
    var fromUsername = msg.from.username;
    check_if_legit_user(fromUsername,function(err,user){
        if(!err && user && user.username===fromUsername){
            remove_auth_user_info_to_db(fromUsername,fromId,function(){
                update_send_list();
            });
            bot.sendMessage(fromId, "*You* ("+fromUsername+"/"+fromId+")  were successfully removed from send list.",{parse_mode:"Markdown"});
        } else {
            bot.sendMessage(fromId, 'Please run /auth [password] first.',{parse_mode:"Markdown"});
        }
    });
});
bot.onText(/\/auth (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var fromUsername = msg.from.username;
    var passwd = match[1];

    check_if_legit_user(fromUsername,function(err, user) {
        console.log(user)
        if (user){
            if(user.chat_id === fromId){
                bot.sendMessage(fromId, "*You* ("+fromUsername+"/"+fromId+") have already been in send list.",{parse_mode:"Markdown"});
            } else {
                bot.sendMessage(fromId, "You ("+fromUsername+"/"+fromId+") have already been in send list. Chat ID changed from "+
                    user.chat_id +" to "+fromId,{parse_mode:"Markdown"});
                update_auth_user_info_to_db(fromUsername,fromId,function(){
                    update_send_list();
                })
            }
        } else {
            if(passwd && passwd === telegram_password){
                bot.sendMessage(fromId, 'Your password is correct. Added to send list.',{parse_mode:"Markdown"});
                add_auth_user_info_to_db(fromUsername,fromId,function(){
                    update_send_list();
                });
            } else {
                bot.sendMessage(fromId, 'Your password is mismatch with correct one, please check your input',{parse_mode:"Markdown"});
            }
        }
    });
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
            if (!json.userId || !json.postId){
                return
            }
            if (json.postId.indexOf('?')>0){
                json.postId = json.postId.split('?')[0];
            }
            if (!json.createdAt){
                json.createdAt = new Date();
            }
            console.log('To save postview: '+JSON.stringify(json));
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
                browse:true,
                mainImage:true
            }},function(err, post) {
                if(!err && post) {
                    send_new_post_info_to_send_list(post)
                }
            });
        }
    });

    //client.publish('raid_cdn_add_torrent',JSON.stringify({token:"sXrfefPZ3CSHS2Mwu",url:"http://zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4",videoLength:78396301,file_path:"/root/docker-share/sXrfefPZ3CSHS2Mwu/zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4"} ));
    // client.publish('raid_cdn_add_torrent',JSON.stringify({token:"token",url:"http://zifacdn.oss-cn-hangzhou.aliyuncs.com/yosemite-hd.mp4",videoLength:78396301}));
});
