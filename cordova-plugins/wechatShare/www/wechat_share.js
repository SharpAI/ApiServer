var WechatShare = function() {};

WechatShare.prototype.shareToMoment = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatShare", "moment", [options]);
};

WechatShare.prototype.shareToSession = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatShare", "session", [options]);
};

WechatShare.prototype.shareToFavorite = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatShare", "favorite", [options]);
};

WechatShare.prototype.share = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatShare", "share", [options]);
};

WechatShare.prototype.login = function(options, success, fail) {
  cordova.exec(function(result) {
    success(result);
  }, function() {
    fail();
  }, "WechatShare", "login", [options]);
};

var wechatShare = new WechatShare();
module.exports = wechatShare;
