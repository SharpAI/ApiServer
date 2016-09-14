/**
 * Created by simba on 9/12/16.
 */

var SlackBot = Meteor.npmRequire('slackbots');

if(Meteor.isServer){
    Meteor.startup(function(){
        var slackBot = new SlackBot({
            token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
            name: 'Post Reporter'
        });
        if(process.env.PRODUCTION){
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Production Server)');
        } else {
            slackBot.postMessageToChannel('general', 'Meteor server(web) of HotShare restarted (Test or Local Server)');
        }

        /**
         * @param {object} data
         */
        slackBot.on('message', function(data) {
            // all ingoing events https://api.slack.com/rtm
            console.log(data);
            var selfMention = '<@'+slackBot.self.id+'> ';

            if(data && data.type === 'message' && !data.subtype){
                var message = data.text;
                if( message.indexOf(selfMention) === 0){
                    console.log('self mention');
                    message = message.replace(selfMention,'');
                    var command = message.split(' ')
                    if(data.user === 'U0HMJ3H4J'){
                        slackBot.postMessageToChannel('general', 'your user id is: '+data.user);
                    }
                    if(command[0] === 'delete'){
                        console.log('to delete id '+command[1]);
                        slackBot.postMessageToChannel('general', 'I know you want to delete post '+ command[1] +' , but the coding is not done.');
                    } else if( command[0] === 'hot' ){
                        slackBot.postMessageToChannel('general', 'Calculating Hottest Posts from NEO4J Database...');
                        var hottestPost = getRawHottestPosts()
                        console.log(hottestPost)
                        if(hottestPost){
                            hottestPost.forEach(function(item){
                                if(item){
                                    slackBot.postMessageToChannel('general', JSON.stringify(item));
                                }
                            });
                        } else {
                            slackBot.postMessageToChannel('general', 'Wow, something wrong? No Hottest Posts in List!!!!');
                        }
                    }
                    else {
                        slackBot.postMessageToChannel('general', 'I don\'t understand your command...\n' +
                            'The possible command are:\n' +
                            'delete postid\n' +
                            'hot');
                    }
                }
            }
        });

        postMessageToGeneralChannel=function(message){
            slackBot.postMessageToChannel('general', message);
        }
    })
}
