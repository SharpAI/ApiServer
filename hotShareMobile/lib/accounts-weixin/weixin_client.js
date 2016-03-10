if (Meteor.isClient) {
  Meteor.loginWithWeixin = function (callback) {
    if (device.platform === 'Android') {
      return WeChat.getUserInfo({}, function (e) {
        Meteor.call('getUserinfo', e.code, function(error, result) {
          if(error || result === null)
            return callback("The Weixin logon failure.");
          
          var options;
          console.log('获取微信用户信息的结果为' + result.nickname);
          options = {
            device: {
              time: new Date()
            },
            weixin: result
          };
          return Accounts.callLoginMethod({
            methodArguments: [options],
            userCallback: function (err, res) {
              if (err) {
                return callback(err);
              } else {
                return callback(null, res);
              }
            }
          });
        });
      }, function () {
          return callback("The Weixin logon failure.");
        });
    } else {
      return WechatShare.getUserInfo({}, function (e) {
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