if (Meteor.isServer) {
  Meteor.methods({
     getUserinfo: function(code) {
       this.unblock();
       return Meteor.wrapAsync(function(callback) {
         var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxcfcf19c225a36351&secret=dbafa3cb0167bbb80bb201ba10127da4&code=" + code + "&grant_type=authorization_code";
         HTTP.call('GET', url, function(error, result){
           if(error)
             return callback && callback(error, null);
           
           console.log(result.content);
           var tokenInfo = JSON.parse(result.content);
           url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + tokenInfo.access_token + "&openid=" + tokenInfo.openid;
           HTTP.call('GET', url, function(error1, result1){
             if(error1)
               return callback && callback(error1, null);
               
             console.log(result1.content);
             callback && callback(null, JSON.parse(result1.content));
           });
         });
       })()
     }
  });

  Accounts.registerLoginHandler('weixin', function(options) {
    if (!options.weixin || !options.weixin.openid) {
      return void 0;
    }
    options.weixin.id = options.weixin.openid;
    return Accounts.updateOrCreateUserFromExternalService('weixin', options.weixin, {
      username: options.weixin.nickname,
      createdAt: new Date(),
      profile: {
        fullname: options.weixin.nickname,
        icon: options.weixin.headimgurl,
        sex: options.weixin.sex === 1 ? 'male' : options.weixin.sex === 2 ? 'female' : void 0,
        location: options.weixin.city
      }
    });
  });
}