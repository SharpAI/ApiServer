if (Meteor.isServer) {
  var WECHAT_APPID = 'wxcfcf19c225a36351';     // 移动应用的 APPID
  var WECHAT_AppSecret = 'dbafa3cb0167bbb80bb201ba10127da4';
  var WEB_WECHAT_APPID = 'wx599196add0e17def'; // 网站应用的 APPID
  var WEB_WECHAT_AppSecret = '783e129bc26650acb5791f19c0e476fc';
  this.OAUTH2_RESULT = [];
  
  Router.route('/oauth2/wechat', function () {
    var query = this.params.query;
    var response = this.response;
    
    var redirectResult = function(result){
      var id = (new Mongo.ObjectID())._str;
      
      if(result)
        OAUTH2_RESULT.push({id: id, result: result});
      else
        OAUTH2_RESULT.push({id: id});
        
      // response.end('<head><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimal-ui" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><style type="text/css">body{margin: 0}\r\n.head{width:100%; height:40px;font-size:16px; line-height:40px; position:fixed; left:0; top:0; border:none; text-align:center; background: #d8210d; z-index: 999;opacity: 0.99;}\r\n.head strong{font-size: 16px; color: #fff}\r\n.pay-return{width: 100%; text-align: center; padding-top: 100px;color: #706B66;}\r\n\r\n.pay-return span{display: block;margin-bottom: 10px;}</style></head><body><div class="pay changePage"><div class="head"><strong>Please wait...</strong></div></div><div style="display:none;"><form id ="oauth2_submit" name="oauth2_submit" method="POST" action="/oauth2/wechat/result"><input type="hidden" name="result_json" value="'+result+'" /></form></div><script>document.forms["oauth2_submit"].submit();</script></body>');
      response.writeHead(302, {'Location': '/oauth2/wechat/result?id=' + id});
      response.end();
    }
    
    if(!query['code'] || query['code'] === ''){
      return redirectResult();
    }else{
      try{
        var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+WEB_WECHAT_APPID+"&secret="+WEB_WECHAT_AppSecret+"&code=" + query['code'] + "&grant_type=authorization_code";
        HTTP.call('GET', url, function(error, result){
          if(error){
            return redirectResult();
          }
          
          console.log(result.content);
          var tokenInfo = JSON.parse(result.content);
          if(!tokenInfo.access_token || !tokenInfo.openid){
            return redirectResult();
          }
          
          url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + tokenInfo.access_token + "&openid=" + tokenInfo.openid;
          HTTP.call('GET', url, function(error1, result1){
            if(error1){
              return redirectResult();
            }
              
            console.log(result1.content);
            return redirectResult(JSON.parse(result1.content));
          });
        });
      }catch (e){
        return redirectResult();
      }
    }
  }, {where: 'server'});
  
  Router.route('/oauth2/wechat/result', function () {
    var query = this.params.query;
    var response = this.response;
    var result = '';
    if(query['id'] && query['id'] != ''){
      if(OAUTH2_RESULT.length > 0){
        for(var i=0;i<OAUTH2_RESULT.length;i++){
          if(OAUTH2_RESULT[i].id === query['id']){
            result = JSON.stringify(OAUTH2_RESULT[i].result);
            OAUTH2_RESULT.splice(i, 1);
            break;
          }
        }
      }
    }
    
    response.end('<head><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimal-ui" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><style type="text/css">body{margin: 0}\r\n.head{width:100%; height:40px;font-size:16px; line-height:40px; position:fixed; left:0; top:0; border:none; text-align:center; background: #d8210d; z-index: 999;opacity: 0.99;}\r\n.head strong{font-size: 16px; color: #fff}\r\n.pay-return{width: 100%; text-align: center; padding-top: 100px;color: #706B66;}\r\n\r\n.pay-return span{display: block;margin-bottom: 10px;}</style></head><body><div class="pay changePage"><div class="head"><strong>Please wait...</strong></div></div><div id="oauth2_result" style="display:none;">'+result+'</div></body>');
  }, {where: 'server'});
  
  Meteor.methods({
     getUserinfo: function(code) {
       this.unblock();
       return Meteor.wrapAsync(function(callback) {
         var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+WECHAT_APPID+"&secret="+WECHAT_AppSecret+"&code=" + code + "&grant_type=authorization_code";
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