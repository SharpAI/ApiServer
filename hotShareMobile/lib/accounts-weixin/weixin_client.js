if (Meteor.isClient) {
  Meteor.loginWithWeixin = function(callback) {
    return WechatOauth.getUserInfo({}, function(e) {
      var options;
      options = {
        device: {
          time: new Date()
        },
        weixin: e
      };
      return Accounts.callLoginMethod({
        methodArguments: [options],
        userCallback: function(err, result) {
          if (err) {
            return callback(err);
          } else {
            return callback(null, result);
          }
        }
      });
    }, function() {
      return callback("The Weixin logon failure.");
    });
  };
}