if Meteor.isClient
  Meteor.startup ()->
    sign_server_url = 'http://sign.tiegushi.com:8080/sign/';
    jQuery.loadScript =  (url, callback)->
      jQuery.ajax({
          url: url,
          dataType: 'script',
          success: callback,
          async: true
        });
    wechatSetup = (signatureResult)->
      wx.config {
        debug: false,
        appId: signatureResult.appid,
        timestamp: signatureResult.timestamp,
        nonceStr: signatureResult.nonceStr,
        signature: signatureResult.signature,
        jsApiList: ['checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone']
      }
    wechatReady = ()->
      timelineData = {
        title: if document.title then document.title else '故事贴主题阅览室',
        desc: "来自故事贴",
        link: window.location.href,
        imgUrl: if document.images and document.images.length > 0 then document.images[0].src else 'http://cdn.tiegushi.com/images/logo.png',
        success: () ->
          console.log('Share success');
        cancel: ()->
          console.log('Share cancled');
      }
      chatShareData = {
        title: if document.title then document.title else '故事贴主题阅览室',
        desc: "来自故事贴",
        link: window.location.href,
        imgUrl: if document.images and document.images.length > 0 then document.images[0].src else 'http://cdn.tiegushi.com/images/logo.png',
        success: () ->
          console.log('Share success');
        cancel: ()->
          console.log('Share cancled');
      }
      
      if(window.frames.length is parent.frames.length)
        wx.onMenuShareTimeline(timelineData)
        wx.onMenuShareQQ(chatShareData)
        wx.onMenuShareWeibo(chatShareData)
        wx.onMenuShareAppMessage(chatShareData)
        wx.onMenuShareQZone(chatShareData)

    setupWeichat = (url)->
      Meteor.call 'getSignatureFromServer',url,(error,result)->
      # if !Session.get('sign_status_'+url)
      #   Session.set('sign_status_'+url,'starting')
      # else if Session.equals('sign_status_'+url,'starting') or Session.equals('sign_status_'+url,'done')
      #   return

      HTTP.get sign_server_url+encodeURIComponent(url),(error,result)->
        #FeedAfterShare(Session.get('postContent'))
        if error
          if localStorage.getItem('savedsignature'+url)
            signatureResult = localStorage.getItem('savedsignature'+url)
            Session.set('sign_status_'+url,'failed')
            console.log('Got Post signature Result from localStorage ' + signatureResult)
        else
          signatureResult = JSON.parse(result.content)
          Session.set('sign_status_'+url,'done')
          # console.log('Got Post signature signatureResult1 ' + signatureResult)
          localStorage.setItem('savedsignature'+url, signatureResult);
        console.log(result)
        console.log('Got Post signature ' + JSON.stringify(signatureResult))
        wechatSetup(signatureResult)
        wx.ready(wechatReady)
    @isWeiXinFunc = ()->
      ua = window.navigator.userAgent.toLowerCase()
      M = ua.match(/MicroMessenger/i)
      if M and M[0] is 'micromessenger'
        true
      else
        false
    @calcPostSignature = (url)->
      if isWeiXinFunc()
        # Session.set('turnOnRandom',true)
        if (typeof wx is 'undefined')
          $.loadScript 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js', ()->
            setupWeichat(url)
        else
          setupWeichat(url)
    calcPostSignature(window.location.href.split('#')[0])