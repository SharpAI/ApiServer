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
        postMessageToGeneralChannel=function(message){
            slackBot.postMessageToChannel('general', message);
        }
    })
}
