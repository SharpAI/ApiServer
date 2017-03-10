if Meteor.isClient
  Session.setDefault("Social.LevelOne.Menu",'discover')
  Session.setDefault("SocialOnButton",'postBtn')
  Template.socialContent.events
    'click .postBtn':->
      #PUB.postPageBack()
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      trackEvent("socialBar","Post")
      Session.set("SocialOnButton",'postBtn')
      Session.set("Social.LevelOne.Menu",'discover')
      if $('.contactsList .head').is(':visible')
        $('.contactsList .head').fadeOut 300
      document.body.scrollTop = 0
      $('.showPosts .head').fadeIn 300
    'click .chatBtn': (e, t)->
      e.stopPropagation()
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      $(".chatBtn .red_spot").hide().html(0)
      trackEvent("socialBar","GroupChat")
      #url = 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
      url = '/simple-chat/to/group?id='+Session.get('postContent')._id
      return Router.go(url);
      if isUSVersion
        url += '#en'
      else
        url += '#zh'
      #window.location.href = url
      shareUrl = 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id
      imgUrl = if Session.get('postContent').mainImage then Session.get('postContent').mainImage else'http://cdn.tiegushi.com/images/logo.png'
      title = if Session.get('postContent').title then Session.get('postContent').title+'－专属阅览室' else '故事贴专属阅览室'
      ref = cordova.ThemeableBrowser.open(url,'_blank',{
          closeButton: {
            image: 'back',
            imagePressed: 'back_pressed',
            align: 'left',
            event: 'closePressed'
          },
          menu: {
            image: 'share',
            imagePressed: 'share_pressed',
            align: 'right',
            cancel: '取消',
            items: [
              {
                event: 'shareWechatFriend',
                label: '微信好友',
                image:'share_weixin_friends'
              },
              {
                event: 'shareWechatFriendField',
                label: '微信朋友圈',
                image:'share_weixin_timeline'
              },
              {
                event: 'shareQQ',
                label: 'QQ好友',
                image:'share_qq_friends'
              },
              {
                event: 'shareQQZone',
                label: 'QQ空间',
                image:'share_qq_qzone'
              },
              {
                event: 'shareMore',
                label: '更多',
                image:'share_more'
              }
            ]
          },
          statusbar: {
            color: '#000000'
          },
          toolbar: {
            height: 44,
            color: '#F0F0F0'
          }
        })
      ref.addEventListener('closePressed', (event) ->
        ref.close()
      )
      ref.addEventListener('toPost', (event) ->
        ref.close()
        console.log("postId:"+event.postId)
        Meteor.setTimeout ()->
          Router.go '/posts/'+event.postId
        ,300
      )
      ref.addEventListener('shareWechatFriend', (event) ->
        console.log("shareWechatFriend Pressed!")
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        downloadFromBCS imgUrl, (result) ->
          if result
            shareToWechatSession title, '来自故事贴', result, shareUrl
          else
            PUB.toast TAPi18n.__('failToGetPicAndTryAgain')
          return  
      )
      ref.addEventListener('shareWechatFriendField', (event) ->
        console.log("shareWechatFriendField Pressed！")
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        downloadFromBCS imgUrl, (result) ->
          if result
            shareToWechatTimeLine title, '来自故事贴', result, shareUrl
          else
            PUB.toast TAPi18n.__('failToGetPicAndTryAgain')
          return 
      )
      ref.addEventListener('shareQQ', (event) ->
        console.log("shareQQ Pressed！")
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        shareToQQ(title, "来自故事贴",imgUrl,shareUrl);
      )
      ref.addEventListener('shareQQZone', (event) ->
        console.log("shareQQZone Pressed！")
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        shareToQQZone(title, "来自故事贴",imgUrl,shareUrl);
      )
      ref.addEventListener('shareMore', (event) ->
        console.log("shareMore Pressed！")
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        downloadFromBCS imgUrl, (result) ->
          if result
            shareToSystem title, '来自故事贴', result, shareUrl
          else
            PUB.toast TAPi18n.__('failToGetPicAndTryAgain')
          return 
      )
      #Session.set("Social.LevelOne.Menu",'chatContent')
      #Session.set("SocialOnButton",'chatContent')
      #t.chatroom.show()
    'click .contactsBtn':->
      trackEvent("socialBar","Newfrineds")
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      Session.set("Social.LevelOne.Menu",'contactsList')
      Session.set("SocialOnButton",'contactsList')
      $('.div_contactsList').css('display',"block")
      $('.div_discover').css('display',"none")
      $('.div_me').css('display',"none")
      document.body.scrollTop = $(".showPostsBox").height()
    'click .discoverBtn':->
      trackEvent("socialBar","Discover")
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      Session.set("SocialOnButton",'discover')
      Session.set('momentsitemsLimit', 10);
      Session.set("Social.LevelOne.Menu",'discover')
      $('.div_contactsList').css('display',"none")
      $('.div_discover').css('display',"block")
      $('.div_me').css('display',"none")
      document.body.scrollTop = $(".showPostsBox").height()
    'click .meBtn':->
      trackEvent("socialBar","Me")
      if Session.equals('isInformationEditing',true)
        $('.showPostsBox,.showPostsLine,.superChatIntroduce').hide()
      else
        $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      Session.set("SocialOnButton",'me')
      Session.set("Social.LevelOne.Menu",'me')
      #Session.set('favouritepostsLimit', 0);
      $('.div_contactsList').css('display',"none")
      $('.div_discover').css('display',"none")
      $('.div_me').css('display',"block")
      document.body.scrollTop = $(".showPostsBox").height()
      triggerScroll=()->
        $(window).trigger('scroll')
      setTimeout(triggerScroll, 500)
  Template.socialContent.created=->
    this.reactivevars = {}
    this.reactivevars.chatcount = new ReactiveVar(0)
  Template.socialContent.rendered=->
    inst = this
    $('.chatBoxContent').css('min-height',$(window).height()-90)
    msg_rest_url = 'http://' + chat_server_url + '/api/gushitie/msgcount/' + Meteor.userId()
    #msg_rest_url = 'http://172.16.10.34:4000/api/gushitie/msgcount/' + Meteor.userId()
    # $.getJSON(msg_rest_url, (data) ->
    #   if data? and data.count?
    #     inst.reactivevars.chatcount.set(data.count)
    # )    
    #url = 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
    #this.chatroom = window.open(url,'_blank', 'location=no,hidden=yes')

  Template.socialContent.helpers
    newcount:()->
      PostFriends.find({meetOnPostId:Session.get("postContent")._id,count:1,ta:{$ne:null}},{sort: {createdAt: -1}}).count()
    feedscount:()->
      Feeds.find({followby:Meteor.userId(),checked:false, eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20}).count()
    haveFeeds:->
      if Feeds.find({followby:Meteor.userId(),checked:false, eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20}).count()>0
        true
      else
        false
    haveNewFriends: ->
      if PostFriends.find({meetOnPostId:Session.get("postContent")._id,count:1,ta:{$ne:null}},{sort:{createdAt:-1}}).count()>0
        true
      else
        false
    whichOne : ->
      Session.get('Social.LevelOne.Menu')
    isFocus : (view) ->
      #if Session.equals("Social.LevelOne.Menu",view)
      if Session.equals("SocialOnButton",view)
        "focusColor"
      else
        ""
    isWaitRead: ()->
      MsgSession.find({userId: Meteor.userId(), waitRead: {$gt: 0}}).count() > 0
    dynamicMe: ()->
      if Session.equals("SocialOnButton",'me')
        return 'me'
      else
        return 'emptyMe'
    chatcount: ()->
      count = Template.instance().reactivevars.chatcount.get()
      if count > 99 then '99+' else count
    haschats: ()->
      return (if Template.instance().reactivevars.chatcount.get() > 0 then true else false) 