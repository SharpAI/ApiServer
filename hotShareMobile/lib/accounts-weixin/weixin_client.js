if (Meteor.isClient) {
  Meteor.loginWithWeixin = function (callback) {
    if (device.platform === 'Android') {
      return WechatOauth.getUserInfo({}, function (e) {
        var options;
        console.log('获取微信用户信息的结果为' + e.nickname);
        options = {
          device: {
            time: new Date()
          },
          weixin: e
        };
        return Accounts.callLoginMethod({
          methodArguments: [options],
          userCallback: function (err, result) {
            if (err) {
              return callback(err);
            } else {
              return callback(null, result);
            }
          }
        });
      }, function () {
          return callback("The Weixin logon failure.");
        });
    } else {
      return WeChat.getUserInfo({}, function (e) {
        var options;
        console.log('获取微信用户信息的结果为' + e.nickname);
        options = {
          device: {
            time: new Date()
          },
          weixin: e
        };
        return Accounts.callLoginMethod({
          methodArguments: [options],
          userCallback: function (err, result) {
            if (err) {
              return callback(err);
            } else {
              return callback(null, result);
            }
          }
        });
      }, function () {
          return callback("The Weixin logon failure.");
        });
    }
  };
}