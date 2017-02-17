if Meteor.isClient
  Meteor.startup ()->
    saved_channel = ''
    Deps.autorun ()->
      unless Session.equals('channel',saved_channel)
        saved_channel = Session.get('channel')
        Meteor.setTimeout ()->
          calcPostSignature(window.location.href.split('#')[0])
        ,300
    loadScript =  (url, callback)->
      jQuery.ajax({
          url: url,
          dataType: 'script',
          success: callback,
          async: true,
          cache: true
        });
    window.FeedAfterShare=(postContent,extra)->
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
        extra:extra
      });
    window.addToFavouriteAfterShare=(postContent)->
      postId = postContent._id

      if (favp = FavouritePosts.findOne({postId: postId, userId: Meteor.userId()}))
        FavouritePosts.update({_id: favp._id}, {$set: {updateAt: new Date()}})
      else
        FavouritePosts.insert({postId: postId, userId: Meteor.userId(), createdAt: new Date(), updateAt: new Date()})
    wechatSetup = (signatureResult)->
      console.log('wechat_sign:', signatureResult)
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
      unless window.networkType
        wx.getNetworkType({
          success:  (res)->
            # networkType = res.networkType; Returns network type, including 2g, 3g, 4g and wifi
            if res?.networkType?
              window.networkType = res.networkType
              if window.networkType is 'wifi'
                Session.set('isWeChatWifi',true)
              else
                Session.set('isWeChatWifi',false)
        })
      # isWechatapi()
      # Session.set('turnOnRandom',false)
      if Session.get('focusedIndex') isnt undefined
        description =Session.get('postContent').pub[Session.get('focusedIndex')].text.replace(/\s\s\s+/g, '');
        description = description.replace(/<\/?.+?>/g,"")
        if !description || description is ''
          description = Session.get("DocumentTitle").replace('『故事贴』','');
        else if(description.length > 100)
          description = description.substring(0, 96)
        section=parseInt(Session.get('focusedIndex'))
        timelineData = {
          title: description,
          desc: description,
          link: window.location.href,
          imgUrl: Session.get('postContent').mainImage,
          success: () ->
            trackEvent("Share","Section to Wechat Timeline")
            FeedAfterShare(Session.get('postContent'),{wechat:{type:'timeline',section:section}})
            addToFavouriteAfterShare(Session.get('postContent'))
            # if Session.get('inWechatBrowser') is true
            #   Session.set('shareToWechatType','WXSession')
            #   $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
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
            FeedAfterShare(Session.get('postContent'),{wechat:{type:'chat',section:section}})
            addToFavouriteAfterShare(Session.get('postContent'))
            # if Session.get('inWechatBrowser') is true
            #   Session.set('shareToWechatType','WXTimeLine')
            #   $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
            console.log('Share success');
          cancel: ()->
            console.log('Share cancled');
        }
      else
        patagraphLength = Session.get('postContent').pub.length
        invalidString = "您当前程序不支持视频观看"
        if  patagraphLength > 0 and patagraphLength < 2
          textArr = Session.get('postContent').pub
          for i in [patagraphLength - 1..0]
            if textArr[i].text is invalidString
              descriptionFirstParagraph = "来自故事贴"
            else if textArr[i].text
              descriptionFirstParagraph = textArr[i].text.replace(/<\/?.+?>/g,"")
              descriptionFirstParagraph = descriptionFirstParagraph.substring(0, 96)
        else if  patagraphLength >= 2
          textArr = Session.get('postContent').pub
          for i in [patagraphLength - 1..0]
            if textArr[i].text and textArr[i].text isnt invalidString
              console.log(textArr[i].text)
              descriptionFirstParagraph = textArr[i].text.replace(/<\/?.+?>/g,"")
              descriptionFirstParagraph = descriptionFirstParagraph.substring(0, 96)
        else
          descriptionFirstParagraph = Session.get("DocumentTitle")
        timelineData = {
          title: Session.get("DocumentTitle"),
          desc: Session.get("DocumentTitle"),
          link: window.location.href,
          imgUrl: Session.get('postContent').mainImage,
          success: () ->
            trackEvent("Share","Post to Wechat Timeline")
            FeedAfterShare(Session.get('postContent'),{wechat:{type:'timeline'}})
            addToFavouriteAfterShare(Session.get('postContent'))
            
            hotPosts = _.filter Session.get('hottestPosts') || [], (value)->
              return !value.hasPush
            if hotPosts.length > 0 or (Meteor.user().profile and Meteor.user().profile.web_follower_count and Meteor.user().profile.web_follower_count > 0)
              $('.shareReaderClub,.shareReaderClubBackground').show()
            # if Session.get('inWechatBrowser') is true
            #   Session.set('shareToWechatType','WXSession')
            #   $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
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
            FeedAfterShare(Session.get('postContent'),{wechat:{type:'chat'}})
            addToFavouriteAfterShare(Session.get('postContent'))
            
            hotPosts = _.filter Session.get('hottestPosts') || [], (value)->
              return !value.hasPush
            if hotPosts.length > 0 or (Meteor.user().profile and Meteor.user().profile.web_follower_count and Meteor.user().profile.web_follower_count > 0)
              $('.shareReaderClub,.shareReaderClubBackground').show()
            # if Session.get('inWechatBrowser') is true
            #   Session.set('shareToWechatType','WXTimeLine')
            #   $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
            console.log('Share success');
          cancel: ()->
            console.log('Share cancled');
        }
      wx.onMenuShareTimeline(timelineData);
      wx.onMenuShareQQ(chatShareData);
      wx.onMenuShareWeibo(chatShareData);
      wx.onMenuShareAppMessage(chatShareData);
      wx.onMenuShareQZone(chatShareData);

    setupWeichat = (url)->
      #Meteor.call 'getSignatureFromServer',url,(error,result)->
      if !Session.get('sign_status_'+url)
        Session.set('sign_status_'+url,'starting')
      else if Session.equals('sign_status_'+url,'starting')
        return
      # 在微信中多页面切换，使用返回键时会导致触发done而不更新分享的内容，从而导致分享的内容和当前页面不符。
      # else if Session.equals('sign_status_'+url,'done')
      #   return

      HTTP.get sign_server_url+encodeURIComponent(url),(error,result)->
        #FeedAfterShare(Session.get('postContent'))
        if error
          Session.set('sign_status_'+url,'failed')
          console.log('Get Post signature failed')
          Meteor.setTimeout ()->
            setupWeichat(url)
          ,3000
        else
          signatureResult = JSON.parse(result.content)
          Session.set('sign_status_'+url,'done')
          console.log('Got Post signature ' + JSON.stringify(signatureResult))

          Meteor.setTimeout ()->
            Session.set('sign_status_'+url,'expired')
          ,30000
          wechatSetup(signatureResult)
          wx.ready(wechatReady)
    @calcPostSignature = (url)->
      if isWeiXinFunc()
        # Session.set('turnOnRandom',true)
        if (typeof wx is 'undefined')
          loadScript 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js', ()->
            setupWeichat(url)
        else
          setupWeichat(url)
