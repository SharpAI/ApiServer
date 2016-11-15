/**
 * Created by simba on 9/12/16.
 */

var SlackBot = Meteor.npmRequire('slackbots');
var os = Meteor.npmRequire("os");
var Skyweb = Meteor.npmRequire('skyweb');

var hostname = os.hostname();
var production = process.env.PRODUCTION;

var usage = '===============================================================\n' +
    'delete [user/post] <id>   删除贴子/用户\n' +
    'restore [user/post] <id>  恢复贴子/用户\n' +
    'check <postId>            绿网检查贴子\n' +
    'miss <postId>             通过帖子审核\n' +
    'pass <postId>             不通过帖子审核\n' +
    'verfily <userId>          验证用户是否在白名单\n'+
    'trust <userId>            添加用户到白名单\n' +
    'mistrust <userId>         从白名单移除用户\n' +
    'server                    获取服务器状态(暂未启用)\n' +
    'startAutoReview           开启自动审核\n' +
    'stopAutoReview            关闭自动审核\n' +
    'queryAutoReview           查询当前自动审核状态\n' +
    '===============================================================';
var commandHandler = function(command){
    console.log(command[0]);
    switch(command[0]){
        case 'startAutoReview':
            autoReview = true;
            Configs.update({name: 'reviewConfig'}, {$set: {'items.autoReview': true}});
            postMessageToGeneralChannel('自动审核开启成功！');
            break;
        case 'stopAutoReview':
            autoReview = false;
            Configs.update({name: 'reviewConfig'}, {$set: {'items.autoReview': false}});
            postMessageToGeneralChannel('自动审核关闭！');
        case 'queryAutoReview':
            if (autoReview)
                resp = '自动审核当前为开启状态！';
            else
                resp = '自动审核当前为关闭状态！';
            postMessageToGeneralChannel(resp);
        case 'verfily':
            Meteor.call('isTrustedUser',command[1],function(err,result){
                if(!err && result){
                    if(!result.hasUser){
                        return postMessageToGeneralChannel('用户不存在！');
                    } else {
                        if(result.isTrusted){
                            postMessageToGeneralChannel('用户在白名单中！');
                        } else {
                            postMessageToGeneralChannel('用户不在白名单中！');
                        }
                    }
                }
            });
            break;
        case 'trust':
            Meteor.call('markUserAsTrusted',command[1],function(err,result){
                if(!err && result){
                    if(result.noUser){
                        return postMessageToGeneralChannel('用户不存在！');
                    }
                    postMessageToGeneralChannel('用户已添加到白名单～');
                } else {
                    postMessageToGeneralChannel('添加到白名单失败！');
                }
            });
            break;
        case 'mistrust':
            Meteor.call('markUserAsMistrusted',command[1],function(err,result){
                if(!err && result){
                    if(result.noUser){
                        return postMessageToGeneralChannel('用户不存在！');
                    }
                    postMessageToGeneralChannel('用户已从白名单移除～');
                } else {
                    postMessageToGeneralChannel('从白名单中移除用户失败！');
                }
            });
            break;
        case 'delete':
            if(command[1] === 'user')
                LockedUsers.insert(Meteor.users.findOne({_id: command[2]}), function(err, _id){
                    if(err)
                        return postMessageToGeneralChannel('操作失败，请重试~');
                    Meteor.Slack.sendUserRemove(command[2]);
                });
            else if(command[1] === 'post' || command.length === 2)
                Meteor.call('delectPostAndBackUp', command.length === 2 ? command[1] : command[2], 'YjwXmChf6tfbF772y', function(err, res){
                    if(err)
                        return postMessageToGeneralChannel('操作失败，请重试~');
                    Meteor.Slack.sendPostRemove(command.length === 2 ? command[1] : command[2]);
                });
            break;
        case 'restore':
            if(command[1] === 'user')
                Meteor.call('restoreUser', command[2], 'YjwXmChf6tfbF772y', function(err, res){
                    if(err)
                        return postMessageToGeneralChannel('操作失败，请重试~');
                    Meteor.Slack.sendPostRemove(command[2]);
                });
            else if(command[1] === 'post' || command.length === 2)
                Meteor.call('restorePost', command.length === 2 ? command[1] : command[2], 'YjwXmChf6tfbF772y', function(err, res){
                    if(err)
                        return postMessageToGeneralChannel('操作失败，请重试~');
                    Meteor.Slack.sendPostRemove(command.length === 2 ? command[1] : command[2]);
                });
            break;
        case 'pass':
            Meteor.call('reviewPostPass', 'YjwXmChf6tfbF772y', command[2], function(err, res){
                if(err)
                    return postMessageToGeneralChannel('操作失败，请重试~');
                Meteor.Slack.sendPostReview(command[2]);
            });
            break;
        case 'miss':
            Meteor.call('reviewPostMiss', 'YjwXmChf6tfbF772y', command[2], function(err, res){
                if(err)
                    return postMessageToGeneralChannel('操作失败，请重试~');
                Meteor.Slack.sendPostReview(command[2]);
            });
            break;
        case 'check':
            console.log('user:', Meteor.users.findOne());
            Meteor.Slack.sendPostCheck(command[1]);
            break;
        case 'server':
            // TODO: server status
            break;
        case 'hot':
            slackBot.postMessageToChannel('Calculating Hottest Posts from NEO4J Database...');
            var hottestPost = getRawHottestPosts();
            if(hottestPost)
                return postMessageToGeneralChannel('Wow, something wrong? No Hottest Posts in List!!!!');

            hottestPost.forEach(function(item){
                if(item)
                    postMessageToGeneralChannel(JSON.stringify(item));
            });
            break;
        case 'help':
            postMessageToGeneralChannel(usage);
            break;
        default:
            postMessageToGeneralChannel('I  don\'t understand your command...\n'+usage);
            break;
    }
}
if (withSlackReporter && Meteor.isServer){
    Meteor.startup(function(){
        var slackCommander = new Meteor.Collection('slackcommanders');
        if(production){
            var slackBot = new SlackBot({
                token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
                name: 'Post Reporter'
            });
            postMessageToGeneralChannel(
                'Meteor server(web) of HotShare restarted (Production Server) '+hostname+' AutoReview: '+autoReview);
        } else {
            var slackBot = new SlackBot({
                token: 'xoxb-85358136278-3gwGbIcbaeqZu8wOjefmLWma', // Add a bot https://my.slack.com/services/new/bot and put the token
                name: 'Post Reporter Tester'
            });
            postMessageToGeneralChannel(
                'Meteor server(web) of HotShare restarted (Test/Local Server) '+hostname+' AutoReview: '+autoReview);
        }

        // Example to show how to add slackID into commanders list
        if(!slackCommander.findOne({slackId:'U0HMJ3H4J'})){
            slackCommander._ensureIndex({slackId:true});
            slackCommander.insert({slackId:'U0HMJ3H4J'});
        }
        /**
         * @param {object} data
         */
        slackBot.on('message', Meteor.bindEnvironment(function (data) {
          // 只在测试服务器使用 Are you mad ?
          /*if(process.env.PRODUCTION){
            return false;
          }*/
          // all ingoing events https://api.slack.com/rtm
            //console.log('slack data:', data);
            var selfMention = '<@'+slackBot.self.id+'> ';

            if(data && data.type === 'message' && !data.subtype){
                var message = data.text;
                if( message.indexOf(selfMention) === 0){
                    //console.log('self mention');
                    message = message.replace(selfMention,'');
                    var command = message.split(' ')

                    // if(!slackCommander.findOne({slackId:data.user})){
                    //     postMessageToGeneralChannel('You are not allowed to operate from slack channel, your user id is: '+data.user);
                    //     return
                    // }

                    console.log('slack command:', command[0]);
                    commandHandler(command);
                }
            }
        }, function(e) {
          console.log('slack mesage error:', e);
        }));

        postMessageToGeneralChannel=function(message, params, callback){
            try{
                if(production){
                    postMessageToGeneralChannel( '@everyone ('+hostname+'): '+message, params,function(result){
                        if(result && result.ok){
                            console.log('Send Success of message')
                        } else {
                            console.log('Send Failed of message: '+result)
                        }
                    });
                } else {
                    postMessageToGeneralChannel( '@everyone ('+hostname+'): '+message, params,function(result){
                        if(result && result.ok){
                            console.log('Send Success of message')
                        } else {
                            console.log('Send Failed of message: '+result)
                        }
                    });
                }
                console.log('Sending message: '+message)
            } catch (e){
                console.log('Send message exception: '+e);
                console.log(message)
            }
          callback && callback(null, '');

          // slackBot.postMessageToChannel('server-repoeter', message, params, function(){
          //   // TODO: callback
          //   callback && callback(null, '');
          // });
        }
    })
} else if (withSkypeWebReporter && Meteor.isServer) {
    Meteor.startup(function(){
        var username = 'solderzzc01@gmail.com';
        var password = 'Vk190560';

        var conversationId = '19:34d7527a4fdd4d5f80e9e1021fdffae8@thread.skype';
        var skyweb = new Skyweb();
        var online = false;
        skyweb.login(username, password).then(function (skypeAccount) {
            online = true;
            console.log('Skyweb is initialized now');
            console.log('Here is some info about you:' + JSON.stringify(skyweb.skypeAccount.selfInfo, null, 2));
            console.log('Your contacts : ' + JSON.stringify(skyweb.contactsService.contacts, null, 2));
            skyweb.setStatus('Online');

            sendMessage('SkyWeb Bot Going Online.');

            if(production){
                sendMessage('Meteor server(web) of HotShare restarted (Production Server) '+hostname+' AutoReview: '+autoReview);
            } else {
                sendMessage('Meteor server(web) of HotShare restarted (Test/Local Server) '+hostname+' AutoReview: '+autoReview);
            }
        }).catch(function (reason) {
            console.log(reason);
        });

        skyweb.authRequestCallback = function (requests) {
            requests.forEach(function (request) {
                skyweb.acceptAuthRequest(request.sender);
                skyweb.sendMessage("8:" + request.sender, "I accepted you!");
            });
        };
        skyweb.messagesCallback = Meteor.bindEnvironment(function (messages) {
            messages.forEach(function (message) {
                if (message.resource.imdisplayname.indexOf(username) === -1 && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping') {
                    var conversationLink = message.resource.conversationLink;
                    var conversationId = conversationLink.substring(conversationLink.lastIndexOf('/') + 1);
                    console.log(conversationId);
                    //skyweb.sendMessage(conversationId, message.resource.content + '. Cats will rule the World');
                    console.log(message.resource.content);
                    var command = message.resource.content.split(' ');
                    console.log(command);
                    commandHandler(command);
                }
            });
        });

        var sendMessage=function(message){
            skyweb.sendMessage(conversationId, message);
        };

        postMessageToGeneralChannel=function(message, params, callback){
            console.log(message)
            if(message && message !==''){
                var msg = message.split('\n');
                msg.forEach(function(item){
                   if(item && item !==''){
                       sendMessage(item);
                   }
                });
            }
            if(params){
                sendMessage(JSON.stringify(params));
            }

        }
    })
} else {
    postMessageToGeneralChannel=function(message, params, callback){
        console.log('We dont really send bot command.')
    }
}
