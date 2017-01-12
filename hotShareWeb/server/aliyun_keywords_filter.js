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
        if (res && res.statusCode == 200) {
            var result = JSON.parse(body);
            console.log(result);
            if(result.Hit){
                console.log('Keywords issue!');
                return callback && callback(null, true);
            } else {
                console.log('Keywords safe!');
                return callback && callback(null, false);
            }
        } else {
            if (res && res.statusCode) {
                console.log(res.statusCode, err);
            } else {
                console.log("res is null or res.statusCode is null.");
            }
            return callback && callback(err || new Error('error'));
        }
    });
};
syncCheckKeywords = function(text){
  return Async.runSync(function(callback) {
    checkKeywords(text, function(err, res){
      if(err)
        return callback(err);
      callback(res);
    });
  }).result;
};


checkKeywords('这不可能是有问题的吧,OK');
checkKeywords('习大大，我们欢迎您,OK');
checkKeywords('，我们彭姑姑欢迎您,OK');