var WechatOauth = function() {};

WechatOauth.prototype.getUserInfo = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatOauth", "moment", [options]);
};
var wechatOauth = new WechatOauth();
module.exports = wechatOauth;
