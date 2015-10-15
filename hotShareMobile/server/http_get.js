// @feiwu
// tips:只用于客户端进行导入测试，正式环境下请勿使用
//Meteor.methods({
//  'http_get': function(url, headers){
//    var http_call = function(callback){
//      HTTP.call('GET', url, {headers: headers}, function(error, result){
//        callback && callback(error, result);
//      });
//    };
//    return Meteor.wrapAsync(http_call)()
//  }
//});