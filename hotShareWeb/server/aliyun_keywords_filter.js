/**
 * Created by simba on 9/21/16.
 */


var request = Meteor.npmRequire('request');
var composeUrl = Meteor.npmRequire('aliyun-cdi');

checkKeywords = function(text,callback){
    var url = composeUrl({
        AccessKeyID: 'Vh0snNA4Orv3emBj', // 你申请的AccessKeyID
        AccessKeySecret: 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz', // 你申请的AccessKeySecret
        Action: 'TextKeywordFilter', // Action
        Text: text
    });
    request.post(url, function (err, res, body) {
        if (res.statusCode == 200) {
            var result = JSON.parse(body);
            console.log(result);
            if(result.Hit){
                console.log('Keywords issue!')
            } else {
                console.log('Keywords safe!')
            }
        } else {
            console.log(res.statusCode, err);
        }
    });
};


checkKeywords('这不可能是有问题的吧,OK');
checkKeywords('习大大，我们欢迎您,OK');
checkKeywords('，我们彭姑姑欢迎您,OK');