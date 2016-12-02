var Skyweb = require('skyweb');

function lib_skyweb(){
}

lib_skyweb._skywebPostMessage = null;
lib_skyweb.skywebPostMessage = null;

lib_skyweb.skywebInit = function() {
    var username = 'solderzzc01@gmail.com';
    var password = 'Vk190560';

    var conversationId = '19:34d7527a4fdd4d5f80e9e1021fdffae8@thread.skype';
    var skyweb = new Skyweb();
    var online = false;
    console.log('Skyweb is initializing... ');
    skyweb.login(username, password).then(function (skypeAccount) {
        online = true;
        console.log('Skyweb is initialized now');
        console.log('Here is some info about you:' + JSON.stringify(skyweb.skypeAccount.selfInfo, null, 2));
        console.log('Your contacts : ' + JSON.stringify(skyweb.contactsService.contacts, null, 2));
        skyweb.setStatus('Online');

        var sendMessage=function(message){
            skyweb.sendMessage(conversationId, message);
        };
        lib_skyweb._skywebPostMessage = sendMessage;
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
}

lib_skyweb.skywebPostMessage = function(serverName, msg, receivers) {
    if(!msg) {
        console.log('skywebPostMessage invalid args')
        return
    }

    if(!lib_skyweb._skywebPostMessage) {
        console.log('skywebPostMessage transporter not initialized')
        return
    }

    lib_skyweb._skywebPostMessage(':< ' + msg);
}

module.exports = lib_skyweb
