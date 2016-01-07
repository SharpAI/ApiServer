if Meteor.isClient
  Meteor.startup ()->
    jQuery.loadScript =  (url, callback)->
      jQuery.ajax({
          url: url,
          dataType: 'script',
          success: callback,
          async: true
        });
    window.FeedAfterShare=(postContent)->
      unless Feeds.findOne({followby:Meteor.userId(),postId:postContent._id,eventType: 'share'})
        me = Meteor.user()
        username = me.username
        if me.profile.fullname
          username = me.profile.fullname
        Feeds.insert({
          owner: Meteor.userId()
          ownerName: username,
          ownerIcon: Meteor.user().profile.icon,
          eventType: 'share',
          postId: postContent._id,
          postTitle: postContent.title,
          addontitle: postContent.addontitle,
          mainImage: postContent.mainImage,
          createdAt: new Date(),
          ReadAfterShare:0,
          followby: Meteor.userId(),
          checked: true
        });
    setupWeichat = (url)->
      Meteor.call 'getSignatureFromServer',url,(error,result)->
        #FeedAfterShare(Session.get('postContent'))
        console.log('Got Post signature ' + JSON.stringify(result))
        wx.config {
            debug: false,
            appId: result.appid,
            timestamp: result.timestamp,
            nonceStr: result.nonceStr,
            signature: result.signature,
            jsApiList: ['checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone']
        }
        wx.ready ()->
          if Session.get('focusedIndex') isnt undefined
            description =Session.get('postContent').pub[Session.get('focusedIndex')].text.replace(/\s\s\s+/g, '');
            if !description || description is ''
              description = Session.get("DocumentTitle").replace('『故事贴』','');
            else if(description.length > 100)
              description = description.substring(0, 100)
            timelineData = {
              title: description,
              desc: description,
              link: window.location.href,
              imgUrl: Session.get('postContent').mainImage,
              success: () ->
                trackEvent("Share","Section to Wechat Timeline")
                FeedAfterShare(Session.get('postContent'))
                console.log('Share success');
              cancel: ()->
                console.log('Share cancled');
            }
            chatShareData = {
              title: Session.get("DocumentTitle"),
              desc: description,
              link: window.location.href,
              imgUrl: Session.get('postContent').mainImage,
              success: () ->
                trackEvent("Share","Section to Wechat Chat")
                FeedAfterShare(Session.get('postContent'))
                console.log('Share success');
              cancel: ()->
                console.log('Share cancled');
            }
          else
            patagraphLength = Session.get('postContent').pub.length
            if  patagraphLength > 0
              textArr = Session.get('postContent').pub
              for i in [patagraphLength - 1..0]
                if textArr[i].text
                  console.log(textArr[i].text)
                  descriptionFirstParagraph = textArr[i].text
            else
              descriptionFirstParagraph = Session.get("DocumentTitle")
            timelineData = {
              title: Session.get("DocumentTitle"),
              desc: Session.get("DocumentTitle"),
              link: window.location.href,
              imgUrl: Session.get('postContent').mainImage,
              success: () ->
                trackEvent("Share","Post to Wechat Timeline")
                FeedAfterShare(Session.get('postContent'))
                console.log('Share success');
              cancel: ()->
                console.log('Share cancled');
            }
            chatShareData = {
              title: Session.get("DocumentTitle"),
              desc: descriptionFirstParagraph,
              link: window.location.href,
              imgUrl: Session.get('postContent').mainImage,
              success: () ->
                trackEvent("Share","Post to Wechat Chat")
                FeedAfterShare(Session.get('postContent'))
                console.log('Share success');
              cancel: ()->
                console.log('Share cancled');
            }
          wx.onMenuShareTimeline(timelineData);
          wx.onMenuShareQQ(chatShareData);
          wx.onMenuShareWeibo(chatShareData);
          wx.onMenuShareAppMessage(chatShareData);
          wx.onMenuShareQZone(chatShareData);
    @calcPostSignature = (url)->
      if isWeiXinFunc()
        if (typeof wx is 'undefined')
          $.loadScript 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js', ()->
            setupWeichat(url)
        else
          setupWeichat(url)
if Meteor.isServer
  unless withWeChatSignatureServer
    return;
  token = ''
  ticket = ''
  jsSHA = Meteor.npmRequire('jssha')
  appId = ''
  appSecret = ''
  requestUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appId+'&secret='+appSecret
  `
      // 随机字符串产生函数
      var createNonceStr = function() {
          return Math.random().toString(36).substr(2, 15);
      };

      // 时间戳产生函数
      var createTimeStamp = function () {
          return parseInt(new Date().getTime() / 1000) + '';
      }
      // 计算签名
      var calcSignature = function (ticket, noncestr, ts, url) {
          var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
          shaObj = new jsSHA('SHA-1', 'TEXT');
          shaObj.update(str);
          return shaObj.getHash('HEX');
      }
      // 获取微信签名所需的ticket
      var generateSignature = function (url) {
          var ts = createTimeStamp();
          var nonceStr = createNonceStr();
          var signature = calcSignature(ticket, nonceStr, ts, url);

          console.log('Ticket is '+ticket+'Signature is ' + signature);
          var returnSignatures = {
              nonceStr: nonceStr
              ,appid: appId
              ,timestamp: ts
              ,signature: signature
              ,url: url
          };
          return returnSignatures;
      };
      // 获取微信签名所需的ticket
      var updateTicket = function (access_token) {
          HTTP.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ access_token +'&type=jsapi', function(error,result){
              if(!error) {
                  var resp = result.data
                  console.log('Result is '+JSON.stringify(result));
                  if(resp && resp.ticket){
                      ticket = resp.ticket;
                  }
                  console.log('Ticket is ' + resp.ticket);
              }
          });
      }
      var updateTokenAndTicket = function(){
          HTTP.get(requestUrl, function(error,result) {
              if (!error){
                  console.log('return access_token:  ' + JSON.stringify(result.data));
                  token = result.data.access_token;
                  updateTicket(token);
              }
          });
      }
      SyncedCron.add({
          name: 'Update WeChat token and API',
          schedule: function(parser) {
              // parser is a later.parse object
              return parser.text('every 1 hour');
          },
          job: function() {
              updateTokenAndTicket();
          }
      });
      SyncedCron.start();
  `
  updateTokenAndTicket();
  Meteor.methods
    getSignatureFromServer: (url)->
      check(url, String);
      #console.log('generate Post ID from server ' + url);
      return generateSignature(url);
