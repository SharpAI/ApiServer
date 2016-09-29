/**
 * Created by simba on 9/12/16.
 */

var SlackBot = Meteor.npmRequire('slackbots');
var os = Meteor.npmRequire("os");
var hostname = os.hostname();

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

if(Meteor.isServer){
    Meteor.startup(function(){
        var slackCommander = new Meteor.Collection('slackcommanders');
        var slackBot = new SlackBot({
            token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
            name: 'Post Reporter'
        });
        if(process.env.PRODUCTION){
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Production Server) '+hostname);
        } else {
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Test or Local Server) '+hostname);
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
                    console.log('self mention');
                    message = message.replace(selfMention,'');
                    var command = message.split(' ')

                    // if(!slackCommander.findOne({slackId:data.user})){
                    //     postMessageToGeneralChannel('You are not allowed to operate from slack channel, your user id is: '+data.user);
                    //     return
                    // }

                    console.log('slack command:', command[0]);
                    switch(command[0]){
                      case 'startAutoReview':
                        autoReview = true;
                        Configs.update({name: 'reviewConfig'}, {$set: {'items.autoReview': true}});
                        slackBot.postMessageToChannel('general','自动审核开启成功！');
                        break;
                      case 'stopAutoReview':
                        autoReview = false;
                        Configs.update({name: 'reviewConfig'}, {$set: {'items.autoReview': false}});
                        slackBot.postMessageToChannel('general','自动审核关闭！');
                      case 'queryAutoReview':
                        if (autoReview)
                          resp = '自动审核当前为开启状态！';
                        else
                          resp = '自动审核当前为关闭状态！';
                        slackBot.postMessageToChannel('general',resp);
                      case 'verfily':
                        Meteor.call('isTrustedUser',command[1],function(err,result){
                          if(!err && result){
                            if(!result.hasUser){
                              return slackBot.postMessageToChannel('general','用户不存在！');
                            } else {
                              if(result.isTrusted){
                                slackBot.postMessageToChannel('general','用户在白名单中！');
                              } else {
                                slackBot.postMessageToChannel('general','用户不在白名单中！');
                              }
                            }
                          }
                        });
                        break;
                      case 'trust':
                        Meteor.call('markUserAsTrusted',command[1],function(err,result){
                          if(!err && result){
                            if(result.noUser){
                              return slackBot.postMessageToChannel('general','用户不存在！');
                            }
                            slackBot.postMessageToChannel('general','用户已添加到白名单～');
                          } else {
                            slackBot.postMessageToChannel('general','添加到白名单失败！');
                          }
                        });
                        break;
                      case 'mistrust':
                        Meteor.call('markUserAsMistrusted',command[1],function(err,result){
                          if(!err && result){
                            if(result.noUser){
                              return slackBot.postMessageToChannel('general','用户不存在！');
                            }
                            slackBot.postMessageToChannel('general','用户已从白名单移除～');
                          } else {
                            slackBot.postMessageToChannel('general','从白名单中移除用户失败！');
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
            }
        }, function(e) {
          console.log('slack mesage error:', e);
        }));

        postMessageToGeneralChannel=function(message, params, callback){
          slackBot.postMessageToChannel('general', '<'+hostname+'>: '+message, params);
          callback && callback(null, '');

          // slackBot.postMessageToChannel('server-repoeter', message, params, function(){
          //   // TODO: callback
          //   callback && callback(null, '');
          // });
        }
    })
}
