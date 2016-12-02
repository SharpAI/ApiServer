var SlackBot = require('slackbots');

function lib_slack(){
}

lib_slack.slackBot = null;

lib_slack.slackInit = function() {
    lib_slack.slackBot = new SlackBot({
        token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
        name: 'Post Reporter'
    });
}

lib_slack.slackPostMessage = function(serverName, msg, receivers) {
    if(!msg) {
        console.log('slackPostMessage invalid args')
        return
    }

    if(!lib_slack.slackBot) {
        console.log('slackPostMessage not initialized')
        return
    }

    lib_slack.slackBot.postMessageToChannel('general', msg);
}

module.exports = lib_slack
