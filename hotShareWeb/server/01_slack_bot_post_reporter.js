/**
 * Created by simba on 9/12/16.
 */

var SlackBot = Meteor.npmRequire('slackbots');

if(Meteor.isServer){
    Meteor.startup(function(){
        var slackCommander = new Meteor.Collection('slackcommanders');
        var slackBot = new SlackBot({
            token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
            name: 'Post Reporter'
        });
        if(process.env.PRODUCTION){
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Production Server)');
        } else {
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Test or Local Server)');
        }

        // Example to show how to add slackID into commanders list
        if(!slackCommander.findOne({slackId:'U0HMJ3H4J'})){
            slackCommander._ensureIndex({slackId:true});
            slackCommander.insert({slackId:'U0HMJ3H4J'});
        }
        /**
         * @param {object} data
         */
        slackBot.on('message', function(data) {
            // all ingoing events https://api.slack.com/rtm
            console.log('slack data:', data);
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
                      case 'check':
                        console.log(Meteor.users.findOne());
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
                      default:
                        postMessageToGeneralChannel('I don\'t understand your command...\n' + 
                          'delete [user/post] <id>   删除贴子/用户\n' + 
                          'restore [user/post] <id>  恢复贴子/用户\n' + 
                          'check id                  绿网检查贴子\n' + 
                          'server                    获取服务器状态'
                        );
                        break;
                    }
                }
            }
        });

        postMessageToGeneralChannel=function(message, params, callback){
          slackBot.postMessageToChannel('server-repoeter', message, params);
          callback && callback(null, '');

          // slackBot.postMessageToChannel('server-repoeter', message, params, function(){
          //   // TODO: callback
          //   callback && callback(null, '');
          // });
        }
    })
}
