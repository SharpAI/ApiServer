if (Meteor.isClient) {
  var getUserInfo = function(succes, error) {
    
    var _getUserInfo = function(){
      if(Meteor.isCordova){
        var redirectUrl = "http://host1.tiegushi.com/oauth2/wechat";
        var url = "https://open.weixin.qq.com/connect/qrconnect?appid=wx599196add0e17def&redirect_uri="+ encodeURI(redirectUrl)+"&response_type=code&scope=snsapi_login&state=";
        var ref = cordova.InAppBrowser.open(url, '_blank', 'hidden=no,toolbarposition=top');
        ref.addEventListener('loadstop', function(event) {
          if(event.url.indexOf('/oauth2/wechat/result') != -1){
            ref.executeScript({
              code: "var returnJson = document.getElementById('oauth2_result').innerText;returnJson;"
            }, function(data){
              ref.close();
              
              if(data[0] != '')
                succes(JSON.parse(data[0]));
              else
                error();
            });
          }
        });
      }else{
        error();
      }
    };
    
    if(device.platform === 'Android'){
      WeChat.isWXAppInstalled(function(e){
        if(e.result)
          WeChat.getUserInfo({}, function(result){
            succes(result);
          }, error);
        else
          _getUserInfo();
      }, error);
    }else{
      WechatShare.getUserInfo({}, function(result){
        succes(result);
      }, function(){_getUserInfo();});
    }
  };
  
  Meteor.loginWithWeixin = function (callback) {
    getUserInfo(function(result){
      if(result && result.openid){
        var options;
        console.log('获取微信用户信息的结果为' + result.nickname);
        options = {
          device: {
            time: new Date()
          },
          weixin: result
        };
        Accounts.callLoginMethod({
          methodArguments: [options],
          userCallback: function (err, res) {
            if (err) {
              return callback(err);
            } else {
              return callback(null, res);
            }
          }
        });
      }else{
        callback("The Weixin logon failure.");
      }
    }, function(){callback("The Weixin logon failure.");});
  };
}