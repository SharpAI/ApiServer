/**
 * Created by simba on 5/19/16.
 */
var restify = require('restify');
var request = require('request');
var jsSHA = require('jssha')

/*request('http://www.google.com', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
    }
})*/

var server = restify.createServer({
    name: 'Signiture Server',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


var token = '';
var ticket = ''
var appId = process.env.WECHATAPI_APP_ID || ''
var appSecret = process.env.WECHATAPI_APP_SECRET || ''
var requestUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appId+'&secret='+appSecret

// 随机字符串产生函数
var createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};

// 时间戳产生函数
var createTimeStamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
}
// 计算签名
var calcSignature = function (ticket, noncestr, ts, url) {
    var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
    shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(str);
    return shaObj.getHash('HEX');
}
// 获取微信签名所需的ticket
var generateSignature = function (url) {
    var ts = createTimeStamp();
    var nonceStr = createNonceStr();
    var signature = calcSignature(ticket, nonceStr, ts, url);

    console.log('Ticket is '+ticket+'Signature is ' + signature);
    var returnSignatures = {
        nonceStr: nonceStr
        ,appid: appId
        ,timestamp: ts
        ,signature: signature
        ,url: url
    };
    return returnSignatures;
};
// 获取微信签名所需的ticket
var updateTicket = function (access_token) {
    request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ access_token +'&type=jsapi', function(error,result,body){
        if(!error) {
            var resp = body
            console.log('Result is '+JSON.stringify(body));
            if(resp && resp.ticket){
                ticket = resp.ticket;
            }
            console.log('Ticket is: ' + ticket);
        }
    });
}
var updateTokenAndTicket = function(){
    request(requestUrl, function(error,result,body) {
        if (!error){
            console.log('return access_token:  ' + JSON.stringify(body));
            token = body.access_token;
            updateTicket(token);
        }
    });
}

setInterval(updateTokenAndTicket,60*60*1000);

updateTokenAndTicket();

server.get('/echo/:name', function (req, res, next) {
    res.send({test:req.params.name});
    return next();
});
server.get('/sign/:url', function (req, res, next) {
    var url=req.params.url;
    console.log('To sign this url:'+url);
    var result=generateSignature(url);
    res.send(result);
    return next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});