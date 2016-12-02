const spawn = require('child_process').spawn;
const http = require('http');
var mail = require('./lib/lib_mail.js');
var skyweb = require('./lib/lib_skyweb.js');
var slack = require('./lib/lib_slack.js');
var dailyVerified = false;

var lists = [
    {en: process.env.HOTSHARE,     name: 'hotShare server',      url:'http://host1.tiegushi.com/posts/7EQLESsR5gCm9ftzq'},
    {en: process.env.HOTSHARETEST, name: 'hotShare test server', url:'http://host2.tiegushi.com/posts/7EQLESsR5gCm9ftzq'},
    {en: process.env.CHAT,         name: 'hotShare chat server', url:'http://chat.cdn.tiegushi.com/channel/7EQLESsR5gCm9ftzq'},
    {en: process.env.NEO4J,        name: 'neo4j server',         url:'http://120.24.247.107:7474'},
    {en: process.env.OPSYNC,       name: 'opSync server',        url:'http://120.24.247.107:8083'},
    {en: process.env.SIGN,         name: 'sign server',          url:'http://sign.tiegushi.com:8080/verify'}
];
var mail_receivers = process.env.MAILRECEIVERS || 'ggxxde@163.com';

function post_msg_init() {
    mail.transporterInit();
    skyweb.skywebInit();
    slack.slackInit();
}

function post_msg(serverOption, errCode) {
    var ts = new Date()
    var msg = 'It seems something wrong with ' + serverOption.name + '.\nerrCode:' + errCode + '\nTimeStamp: ' + ts + '\nURL: ' + serverOption.url;

    mail.mailPostMessage(serverOption.name, msg, mail_receivers);
    skyweb.skywebPostMessage(serverOption.name, msg, null);
    slack.slackPostMessage(serverOption.name, msg, null);
}

//post a message to ensure that e-mail/slack/skyweb work well, every 9:00 AM
function dailyCommunicationVerify() {
    var ts = new Date()
    var hour = ts.getHours()
    if (((hour == 9) || (hour == 19) || (hour == 1)) && (dailyVerified == false)) {
        dailyVerified = true;
    }
    else if ((hour != 9) && (hour != 19) && (hour != 1)){
        dailyVerified = false;
        return;
    }
    else
        return

    var serverName = 'communication verify';
    var msg = ts + 'serverMonitor work file with '

    mail.mailPostMessage(serverName, msg + 'e-mail ' + ts, mail_receivers);
    skyweb.skywebPostMessage(serverName, msg + 'skyweb ' + ts, null);
    slack.slackPostMessage(serverName, msg + 'slack ' + ts, null);
}

function checkServerAlive(serverOption) {
    if(!serverOption || !serverOption.name || !serverOption.url) {
        console.log('invalid serverOption !')
        return;
    }

    var ts = new Date()
    console.log('check server: ' + serverOption.name + ' ' + ts)

    http.get(serverOption.url, function(res) {
        console.log(serverOption.name + ': Got response: ' + res.statusCode);
        if (res.statusCode != 200) {
            post_msg(serverOption, res.statusCode)
        }
        // consume response body
        res.resume();
    }).on('error', function(e) {
        console.log(serverOption.name + 'Got error: ' + e.message);
        post_msg(serverOption, e)
    });
}

post_msg_init();

lists.forEach(function(itm){
    if(itm.en)
        checkServerAlive(itm)
})
setInterval(function() {
    dailyCommunicationVerify()
    lists.forEach(function(itm){
        if(itm.en)
            checkServerAlive(itm)
    })
}, 5*60*1000);
