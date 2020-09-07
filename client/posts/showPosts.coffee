if Meteor.isClient
  @isIOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false)
  @isWeiXinFunc = ()->
    ua = window.navigator.userAgent.toLowerCase()
    M = ua.match(/MicroMessenger/i)
    if M and M[0] is 'micromessenger'
      true
    else
      false
  @isAndroidFunc = ()->
    userAgent = navigator.userAgent.toLowerCase()
    return (userAgent.indexOf('android') > -1) or (userAgent.indexOf('linux') > -1)
  window.getDocHeight = ->
    D = document
    Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight)
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight)
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    )
  subscribeCommentAndViewers = ()->
    if Session.get("postContent")
      Meteor.setTimeout ()->
        Meteor.subscribe "comment",Session.get("postContent")._id
        #Meteor.subscribe "viewers",Session.get("postContent")._id
      ,500
  onUserProfile = ->
    @PopUpBox = $('.popUpBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        Session.set('displayUserProfileBox',false)
      onOpen: ->
        Session.set('displayUserProfileBox',true)
  @isWechatapi = ->
    if typeof WeixinJSBridge is 'undefined'
      # alert('请先通过微信打开')
      Session.set('inWechatBrowser',false)
    else
      # alert('gooode')
      Session.set('inWechatBrowser',true)
  Meteor.startup ()->
    $(document).bind("fontresize",$.debounce(250,(event, data)->
        #alert('Font Resized '+data+'px')
        refreshPostContent()
      )
    )
    Session.set("postForward",[])
    Session.set("postBack",[])

    ###
    show big picture will trigger this event
    this code purpose only for width resize
    we need new solution for it
    $(window).on('resize',$.debounce(250,()->
        refreshPostContent()
      )
    )
    ###
  Tracker.autorun ()->
    # isWechatapi()
    if Session.get("needToast") is true
      Session.set("needToast",false)
      scrolltop = 0
      Meteor.setTimeout ()->
        $('.showPosts').get(0).style.overflow = ''
        $('.showPosts').get(0).style.maxHeight = ''
        $('.showPosts').get(0).style.position = ''
        $('.readmore').remove()
        if $('.dCurrent').length
          scrolltop=$('.dCurrent').offset().top
          Session.set("postPageScrollTop", scrolltop)
          document.body.scrollTop = Session.get("postPageScrollTop")
        if Session.get("isPcommetReply") is true
         return
        userName=Session.get("pcommentsName")
        toastr.info(userName+"点评过的段落已为您用蓝色标注！")
      ,1000
  Template.showPosts.onDestroyed ->
    document.body.scrollTop = 0
    Session.set("postPageScrollTop", 0)
    Session.set("showSuggestPosts",false)
    $('.tool-container').remove()

  Session.setDefault('hottestPosts', [])
  Template.showPosts.onRendered ->
    postId = this.data._id
    ownerId = this.data.ownerId
    $.rippleButton();
    # showFollowTips = ()->
    #   owner = Meteor.users.findOne({_id: ownerId})

    #   if !owner
    #     return
    #   # is 0
    #   if !(Counts.has('post_viewer_count_'+Meteor.userId()+'_'+postId))
    #     return
    #   console.log('viewer_counts = '+Counts.get('post_viewer_count_'+Meteor.userId()+'_'+postId))
    #   # off
    #   if !(owner.profile.followTips isnt false)
    #     return
    #   # slef
    #   if Meteor.userId() is owner._id
    #     return
    #   # follower
    #   if Follower.find({userId: Meteor.userId(), followerId: owner._id}).count() > 0
    #     return
    #   # < 3
    #   if Counts.get('post_viewer_count_'+Meteor.userId()+'_'+postId) < 3
    #     return
    #   if Counts.get('post_viewer_count_'+Meteor.userId()+'_'+postId) >= 3
    #     $('.subscribeAutorPage').show()
    # showFollowTips()

    # if Counts.get('post_viewer_count') >= 3 and Follower.find({userId: Meteor.userId(), followerId: Session.get('postContent').owner}).count() <= 0 and localStorage.getItem('tip_auto_follower') != Meteor.userId()
    #   localStorage.setItem('tip_auto_follower', Meteor.userId())
    #   Session.set('subscribeAutorPageType', 'auto')
    #   $('.subscribeAutorPage').show()

    Meteor.subscribe 'usersById', ownerId
    Meteor.call 'getHottestPosts', (err,res)->
      unless err
        Session.set('hottestPosts', res)
    #console.log 'showPost'
    #$('html').attr('xmlns','http://www.w3.org/1999/xhtml')
    #$('html').attr('xmlns:fb','http://ogp.me/ns/fb#')
    #ogMeta = $("meta[property='og:image']")
    #imageSrc = $('head link[id = "icon"]').attr('href')
    #if ogMeta.length is 0
    #   $('head').append('<meta property=og:image content="' + imageSrc + '"/>')
    #else
    #   ogMeta.attr('content',imageSrc)
    #if !amplify.store('chatNotify')
    #  amplify.store('chatNotify',1)
    #if amplify.store('chatNotify') < 6
    #  amplify.store('chatNotify',amplify.store('chatNotify')+1)
    #  $(".chatBtn .red_spot").show().html(1)
    ###
    mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80')
    mqtt_connection.on('connect',()->
      console.log('Connected to server')
      mqtt_connection.subscribe(Session.get('postContent')._id)
      #mqtt_connection.publish(Session.get('postContent')._id, 'Hello u'+Session.get('postContent')._id)
    )
    # isWechatapi()
    mqtt_connection.on 'message',(topic, message)->
      mqtt_msg = JSON.parse(message.toString())
      #console.log(message.toString())
      if mqtt_msg.type and mqtt_msg.type is 'newmessage'
        $('.socialContent .chatFooter').fadeIn 300
        #$(".chatBtn").addClass('twinking')
        #$(".chatBtn i").removeClass('fa-comment-o').addClass('fa-commenting-o')
        mqtt_msg_num = $.trim($(".chatBtn .red_spot").html())
        mqtt_msg_num = if mqtt_msg_num is '' then 0 else parseInt(mqtt_msg_num)
        mqtt_msg_num += 1
        mqtt_msg_num = if mqtt_msg_num > 99 then '99+' else mqtt_msg_num
        $(".chatBtn .red_spot").show().html(mqtt_msg_num)

      #if mqtt_msg.type and mqtt_msg.type is 'newmember'
      $(".chatBtn .chat-icon-img").addClass('twinkling')
      setTimeout(() ->
        $(".chatBtn .chat-icon-img").removeClass('twinkling')
      , 10000);

    ###
    #Calc Wechat token after post rendered.
    if Session.get("postPageScrollTop") isnt undefined and Session.get("postPageScrollTop") isnt 0
      Meteor.setTimeout ()->
          document.body.scrollTop = Session.get("postPageScrollTop")
        , 280

    Meteor.setTimeout ()->
      $showPosts = $('.showPosts')
      $test = $('.showPosts').find('.content .gridster #test')

      if $test and $test.height() > 1000
        $('.showPosts').get(0).style.overflow = 'hidden'
        $('.showPosts').get(0).style.maxHeight = '1500px'
        $('.showPosts').get(0).style.position = 'relative'
        # $showPosts.after('<div class="readmore">继续阅读<i class="fa fa-angle-double-down"></i><div>')
        $showPosts.after('<div class="readmore"><div class="readMoreContent"><i class="fa fa-chevron-down"></i>继续阅读</div></div>')
    , 600

  Template.showPosts.created=->
    layoutHelperInit()
    Session.set("content_loadedCount", 0)
    Meteor.call 'getHottestPosts', (err,res)->
      unless err
        Session.set('hottestPosts', res)
  Template.showPosts.onRendered ->
    Meteor.setTimeout(
      ()->
        if location.search.indexOf('pub_pcom') != -1
          querys = location.search.substr(1).split('&')
          pub_pcom = ''
          if querys.length > 0
            _.map querys, (item)->
              if item.split('=')[0] is 'pub_pcom'
                pub_pcom = item.split('=')[1]
        if pub_pcom
          # show full
          $showPosts = $('.showPosts')
          $('.showPosts').get(0).style.overflow = ''
          $('.showPosts').get(0).style.maxHeight = ''
          $('.showPosts').get(0).style.position = ''
          $('.readmore').remove()

          # set top
          $("html,body").animate({scrollTop: $('#'+pub_pcom+' .pcomment').offset().top-50}, 300);
      600
    )
  Template.showPosts.onRendered ->
    Meteor.call 'getHottestPosts', (err,res)->
      unless err
        Session.set('hottestPosts', res)
    Session.setDefault "toasted",false
    Session.set('postfriendsitemsLimit', 10)
    Session.set("showSuggestPosts",false)
    $('.mainImage').css('height',$(window).height()*0.55)
    postContent = Session.get("postContent")
    subscribeCommentAndViewers()
    calcPostSignature(window.location.href.split('#')[0])
    title=postContent.title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '')
    if postContent.publish is false
#      Router.go('/unpublish')
      $('.unpublishWebPage').fadeIn 0
    if postContent.addontitle
      title=title+":"+postContent.addontitle
    trackPage('http://cdn.tiegushi.com/posts/'+postContent._id,title)
    Session.set("Social.LevelOne.Menu",'discover')
    Session.set("SocialOnButton",'postBtn')
    if not Meteor.isCordova
      favicon = document.createElement('link');
      favicon.id = 'icon';
      favicon.rel = 'icon';
      favicon.href = postContent.mainImage;
      document.head.appendChild(favicon);
    Deps.autorun (h)->
      if Meteor.userId() and Meteor.userId() isnt ''
        h.stop()
        if location.pathname.split('/').length is 3
          Session.set('section_forward_flag', false)

        if Session.get("NoUpdateShare") is true
          Session.set "NoUpdateShare",false
          Meteor.call 'readPostReport',postContent._id,Meteor.userId(),true, (err, res)->
            if !err and res is true and !Session.equals('section_forward_flag', true)
              console.log 'readPostReport:', res
              $('.subscribeAutorPage').show()
        else
          Meteor.call 'readPostReport',postContent._id,Meteor.userId(),false, (err, res)->
            if !err and res is true and !Session.equals('section_forward_flag', true)
              console.log 'readPostReport:', res
              $('.subscribeAutorPage').show()
#    $('.textDiv1Link').linkify();
    $("a[target='_blank']").click((e)->
      e.preventDefault();
      if Meteor.isCordova
        Session.set("isReviewMode","undefined")
        prepareToEditorMode()
        PUB.page '/add'
        handleAddedLink($(e.currentTarget).attr('href'))
      else
        window.open($(e.currentTarget).attr('href'), '_blank', 'hidden=no,toolbarposition=top')
    )

    $('.showBgColor').css('min-height',$(window).height())
    showSocialBar = ()->
      displaySocialBar = $(".socialContent #socialContentDivider").isAboveViewPortBottom();
      if displaySocialBar
        unless $('.contactsList .head').is(':visible')
          $('.contactsList .head').fadeIn 300
        unless $('.userProfile .head').is(':visible')
          $('.userProfile .head').fadeIn 300
      unless $('.socialContent .chatFooter').is(':visible')
        $('.socialContent .chatFooter').fadeIn 300
    hideSocialBar = ()->
      if $('.contactsList .head').is(':visible')
        $('.contactsList .head').fadeOut 300
      if $('.socialContent .chatFooter').is(':visible')
        $('.socialContent .chatFooter').fadeOut 300
    scrollEventCallback = ()->
      #Sets the current scroll position
      st = $(window).scrollTop()
      if st <= 40
        showSocialBar()
        unless $('.showPosts .head').is(':visible')
          $('.showPosts .head').fadeIn 300
        window.lastScroll = st
        return
      if withForcePopupSectionReview
        #amplify.store('section_'+Session.get('channel'),false)
        if Session.get('focusedIndex') isnt undefined and  $(".showPosts .gridster").isAboveViewPortBottom() and !amplify.store('section_'+Session.get('channel')) and !$('.commentOverlay').data('bPopup')
          $('body').attr('style','position:fixed;')
#          $("body").css("overflow","hidden");
          top = 2 * $(window).height()/ 5
          left = $(window).width()/ 10
          #$('.commentOverlay').bPopup
          @PopUpBox = $('.popUpBox').bPopup
            positionStyle: 'fixed'
            position: [left, top]
            modalClose: false
            onOpen:->
              Session.set("displaySectionReviewBox", true)
            onClose: ->
              Session.set("displaySectionReviewBox", false)
              amplify.store('section_'+Session.get('channel'),true)
      if window.lastScroll - st > 5
        $('.showPosts .head').fadeIn 300
        showSocialBar()
      if window.lastScroll - st < -5
        $('.showPosts .head').fadeOut 300
        displaySocialBar = $(".socialContent #socialContentDivider").isAboveViewPortBottom();
        if displaySocialBar
          Session.set("showSuggestPosts",true)
          showSocialBar()
        else
          hideSocialBar()
      if(st + $(window).height()) is window.getDocHeight()
        showSocialBar()
        window.lastScroll = st
        return
      # Changed is too small
      if Math.abs(window.lastScroll - st) < 5
        return
      #Determines up-or-down scrolling
      displaySocialBar = $(".socialContent #socialContentDivider").isAboveViewPortBottom();
      if displaySocialBar
        #showSocialBar()
        if $(".div_discover").css("display") is "block"
          Session.set("SocialOnButton",'discover')
        if $(".div_contactsList").css("display") is "block"
          Session.set("SocialOnButton",'contactsList')
        if $(".div_me").css("display") is "block"
          Session.set("SocialOnButton",'me')
      else
        if $('.contactsList .head').is(':visible')
          $('.contactsList .head').fadeOut 300
        Session.set("SocialOnButton",'postBtn')
      #Updates scroll position
      window.lastScroll = st
    window.lastScroll = 0;

    if withSocialBar
      $(window).scroll(scrollEventCallback)

  Template.showPosts.helpers
    showPostGroupChatIntro:->
      return !localStorage.getItem('postGroupChatIntro')
    showSaveTipHintTemplate:->
      return !localStorage.getItem('savetipFlag')
    msgs_count: ->
      if Posts.findOne({_id: Session.get('postContent')._id}).owner isnt Meteor.userId()
        return 0

      result  = 0
      pub = Posts.findOne({_id: Session.get('postContent')._id}).pub
      console.log 'pub:', pub
      _.map pub, (item)->
        if item.pcomments and item.pcomments.length > 0
          _.map item.pcomments, (pcom)->
            if pcom.read isnt true and pcom.createdAt >= new Date('2016-09-12 00:00:00') and pcom.userId != Meteor.userId()
              result += 1

      console.log 'msgs:', result
      return result
    has_msgs: (val)->
      return val > 0
    withSectionMenu: withSectionMenu
    withSectionShare: withSectionShare
    withPostTTS: withPostTTS
    authorInfo: ()->
      user = Meteor.users.findOne({_id: @owner})
      authorName = if user.profile.fullname then user.profile.fullname else user.username
      authorIcon = user.profile.icon
      authorInfo = {
        authorName: authorName
        authorIcon: authorIcon
      }
      return authorInfo
    oldMail: ->
      Template.SubscribeAuthor.__helpers.get('oldMail')()
    authorReadPopularPosts: ()->
      myHotPosts = Meteor.users.findOne({_id: @owner}).myHotPosts
      if (myHotPosts && myHotPosts.length >= 3)
        return myHotPosts
      else
        Meteor.subscribe "authorReadPopularPosts",@owner,@_id,3
        mostReadPosts = Posts.find({_id: {$ne: @_id},owner: @owner, publish: {$ne: false}},{sort: {browse: -1},limit: 3}).fetch()
        if (myHotPosts == undefined || myHotPosts == null)
          myHotPosts = []
        if (mostReadPosts == undefined || mostReadPosts == null)
          mostReadPosts = []
        size = myHotPosts.length
        idx = 0
        while (size < 3 && idx < mostReadPosts.length)
          inHotPosts = false
          for itemPost in myHotPosts
            if itemPost.postId and itemPost.postId is mostReadPosts[idx]._id
              inHotPosts = true
          unless inHotPosts
            myHotPosts.push(mostReadPosts[idx])
          idx++
          size = myHotPosts.length
      return myHotPosts
    readerIsOwner: ()->
      return @owner is Meteor.userId()
    showImporting: ()->
      Session.get('postContent').status is 'importing' and Session.get('postContent').ownerId is Meteor.userId()
    hiddenChatLoad: ()->
      Session.equals('isWeChatWifi',true) and Meteor.userId()
    chatUrl: ()->
      return 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
    clickedCommentOverlayThumbsUp:()->
      i = Session.get('focusedIndex')
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].likeUserId[userId] is true
        return true
      else
        return false
    clickedCommentOverlayThumbsDown:()->
      i = Session.get('focusedIndex')
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].dislikeUserId[userId] is true
        return true
      else
        return false
    popUpBoxStyle:()->
      if Session.get('displaySectionReviewBox') is true
        "height: auto;width: 80%;min-width: 80%;border-radius: 5px;"
      else
        "height: 100%;width: 100%;min-width: 100%;"
    # turnOnRandom:()->
    #   if Session.get('turnOnRandom') is true
    #     return true
    #   else
    #     return false
    displayPostContent:()->
      Session.get('displayPostContent')
    getMainImageHeight:()->
      # $(window).height()*0.55
      window.screen.height * 0.5
    getAbstractSentence:->
      if Session.get('focusedIndex') isnt undefined
        Session.get('postContent').pub[Session.get('focusedIndex')].text
      else
        null
    getAbstractSentenceIndex:->
      pub = Session.get('postContent').pub
      index = Session.get('focusedIndex')
      count = 0
      for i in [0..index]
        if pub[i].type is 'text'
          count++
      count
    displayFollowBtn: ()->
      postForward = Session.get("postForward")
      postBack = Session.get("postBack")
      if postBack.length>0 or postForward.length>0
        true
      else
        false
    displayForwardBtn:()->
      postForward = Session.get("postForward")
      if postForward is undefined or postForward.length is 0
        false
      else
        true
      # if history.length>1 and Session.get("historyForwardDisplay") is true
      #   postId=Session.get("postContent")._id
      #   lastId=Session.get("lastPost")
      #   if postId isnt lastId
      #     true
      #   else
      #     false
      # else
      #   false
    displayBackBtn:()->
      postBack = Session.get("postBack")
      if postBack is undefined or postBack.length is 0
        false
      else
        true
      # if history.length>1
      #   postId=Session.get("postContent")._id
      #   firstId=Session.get("firstPost")
      #   if postId isnt firstId
      #     true
      #   else
      #     false
      # else
      #   postId=Session.get("postContent")._id
      #   Session.set("firstPost",postId)
      #   false
    getPostContent:(obj)->
      self = obj
      self.pub = self.pub || []
      if withSponserLinkAds
        position = 1+(self.pub.length / 2)
        self.pub.splice(position,0,{adv:true,type:'insertedLink',data_col:1,data_sizex:6,urlinfo:'http://cdn.tiegushi.com/posts/qwWdWJPMAbyeo8tiJ'})
        _.map self.pub, (doc, index, cursor)->
          if position < index
            _.extend(doc, {index: index-1})
          else
            _.extend(doc, {index: index})
      else
        _.map self.pub, (doc, index, cursor)->
          _.extend(doc, {index: index})
    getPub:->
      self = this
      contentList = Template.showPosts.__helpers.get('getPostContent')(self)
      loadedCount = if Session.get("content_loadedCount") then Session.get("content_loadedCount") else 0
      console.log("loadedCount="+loadedCount+", "+contentList.length)
      newLoadedCount = contentList.length
      if (loadedCount < contentList.length)
        if loadedCount+10 < contentList.length
          newLoadedCount = loadedCount+10
        else
          newLoadedCount = contentList.length
        if Session.get("content_loadedCount") isnt newLoadedCount
          Meteor.setTimeout(()->
              Session.set("content_loadedCount", newLoadedCount)
            , 0)
      contentList.slice(0, newLoadedCount)
    getPub2:->
      self = this
      self.pub = self.pub || []
      if withSponserLinkAds
        position = 1+(self.pub.length / 2)
        self.pub.splice(position,0,{adv:true,type:'insertedLink',data_col:1,data_sizex:6,urlinfo:'http://cdn.tiegushi.com/posts/qwWdWJPMAbyeo8tiJ'})
        _.map self.pub, (doc, index, cursor)->
          if position < index
            _.extend(doc, {index: index-1})
          else
            _.extend(doc, {index: index})
      else
        _.map self.pub, (doc, index, cursor)->
          _.extend(doc, {index: index})
    displayCommentInputBox:()->
      Session.get('displayCommentInputBox')
    inWeiXin: ()->
      isWeiXinFunc()
    withAfterPostIntroduce: ()->
      withAfterPostIntroduce
    withSocialBar: ()->
      withSocialBar
    isCordova:()->
      Meteor.isCordova
    refcomment:->
      RC = Session.get 'RC'
      #console.log "RC: " + RC
      RefC = Session.get("refComment")
      if RefC
        return RefC[RC].text
    time_diff: (created)->
      GetTime0(new Date() - created)
    isMyPost:->
      if Meteor.user()
        if Posts.find({_id:this._id}).count() > 0
          post = Posts.find({_id:this._id}).fetch()[0]
          if post.owner is Meteor.userId()
            return true
      return false
    isMobile:->
      Meteor.isCordova
    haveUrl:->
      if Session.get("postContent").fromUrl is undefined  or Session.get("postContent").fromUrl is ''
        false
      else
        true
    get_share_class: (val1, val2)->
      return if val1 is true and val2 is true then 'two' else ''
    has_share_hot_post: ->
      hotPosts = _.filter Session.get('hottestPosts') || [], (value)->
        return !value.hasPush
      return hotPosts.length > 0
    has_share_follower: ->
      if Session.get('postContent').owner isnt Meteor.userId()
        return false
      return if Meteor.user().profile and Meteor.user().profile.web_follower_count then Meteor.user().profile.web_follower_count > 0 else false
  sectionToolbarClickHandler = (self,event,node)->
    console.log('Index ' + self.index + ' Action ' + $(node).attr('action') )
    action = $(node).attr('action')
    if action is 'section-forward'
      if Meteor.isCordova
        options = {
          'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT, # default is THEME_TRADITIONAL
          'title': '分享',
          'buttonLabels': ['分享给微信好友', '分享到微信朋友圈','分享到QQ','分享到更多应用'],
          'androidEnableCancelButton' : true, #default false
          'winphoneEnableCancelButton' : true, #default false
          'addCancelButtonWithLabel': '取消',
          #'position': [20, 40] # for iPad pass in the [x, y] position of the popover
        }
        window.plugins.actionsheet.show(options, (buttonIndex)->
          switch buttonIndex
            when 1 then shareTo('WXSession',Blaze.getData($('.showPosts')[0]),self.index)
            when 2 then shareTo('WXTimeLine',Blaze.getData($('.showPosts')[0]),self.index)
            when 3 then shareTo('QQShare',Blaze.getData($('.showPosts')[0]),self.index)
            when 4 then shareTo('System',Blaze.getData($('.showPosts')[0]),self.index)
        );
      else
        i = Session.get "pcommentIndexNum"
        postId = Session.get("postContent")._id
        post = Session.get("postContent").pub

        # if (favp = FavouritePosts.findOne({postId: postId, userId: Meteor.userId()}))
        #   FavouritePosts.update({_id: favp._id}, {$set: {updateAt: new Date()}})
        # else
        #   FavouritePosts.insert({postId: postId, userId: Meteor.userId(), createdAt: new Date(), updateAt: new Date()})

        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"pshare","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )

        Session.set("doSectionForward",true)
        toastr.success('将在微信分享时引用本段内容', '您选定了本段文字')
        console.log('Selected index '+self.index)
        Session.set('section_forward_flag', true)
        Router.go('post_index', {_id: Session.get('postContent')._id, _index: self.index})
        #Router.go('/posts/'+Session.get('postContent')._id+'/'+self.index)
  Template.showPosts.events
    'click .authorReadPopularPostItem': (e)->
      postId = e.currentTarget.id
      unless postId
        postId = this._id
      unless postId
        postId = this.postId
      currentPostId = Session.get("postContent")._id
      postBack = Session.get("postBack")
      postBack.push(currentPostId)
      Session.set("postForward",[])
      Session.set("postBack",postBack)
      Session.set("lastPost",postId)
      Session.set('postContentTwo', postId)
      Router.go '/posts/' + postId
    # 'click .shareTheReadingRoom .btnYes': ()->
    #   $('.shareTheReadingRoom,.shareAlertBackground').hide()
    #   Router.go '/hotPosts/' + Session.get('postContent')._id
    # 'click .shareTheReadingRoom .btnNo': ()->
    #   $('.shareTheReadingRoom,.shareAlertBackground').hide()
    'click .shareReaderClub .share-hot-post': ()->
      $('.shareReaderClub,.shareReaderClubBackground').hide()
      Router.go '/hotPosts/' + Session.get('postContent')._id
    'click .shareReaderClub .share-fllower': ()->
      $('.shareReaderClub,.shareReaderClubBackground').hide()
      Meteor.call('sendEmailByWebFollower', Session.get('postContent')._id, 'share')
      toastr.success('此篇故事已经通过邮件发给您的关注者（'+Meteor.user().profile.web_follower_count+'位）', '分享成功~')
    'click .shareReaderClub .reader-club-head': ()->
      $('.shareReaderClub,.shareReaderClubBackground').hide()
    'click .shareReaderClubBackground': ()->
      $('.shareReaderClub,.shareReaderClubBackground').hide()
    # 'click .shareAlertBackground': ()->
    #   $('.shareTheReadingRoom,.shareAlertBackground').hide()
    'click .pub-me-post': ()->
      if withServerImport is true
          Router.go('/import')
      else
          if isIOS
            trackEvent('Download','from Post Header, IOS')
          else if isAndroidFunc()
            trackEvent('Download','from Post Header, Android')
          else
            trackEvent('Download','from Post Header, Outside Wechat')
          window.open('http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere', '_system')
    'click .readmore': (e, t)->
      # if e.target is e.currentTarget
      $showPosts = $('.showPosts')
      $('.showPosts').get(0).style.overflow = ''
      $('.showPosts').get(0).style.maxHeight = ''
      $('.showPosts').get(0).style.position = ''
      $('.readmore').remove()
    'click .unpublishWebPage': (e)->
      postBack = Session.get("postBack")
      postBackId = postBack.pop()
      Session.set("postForward",[])
      Session.set("postBack",postBack)
      Session.set("pcommetsId","")
      Session.set("pcommentsName","")
      $(window).children().off()
      $(window).unbind('scroll')
      if postBackId isnt undefined
        Router.go '/posts/' + postBackId
    'click .abstract_thumbsUp': (e)->
      i = Session.get('focusedIndex')
      commentOverlayThumbsUpHandler(i)
    'click .abstract_thumbsDown': (e)->
      i = Session.get('focusedIndex')
      commentOverlayThumbsDownHandler(i)
    'click .abstract_commentGray': (e)->
      Session.set("pcommetsId","")
      backgroundTop = 0-$(window).scrollTop()
      Session.set('backgroundTop', backgroundTop);
      $('.pcommentInput,.alertBackground').fadeIn 300, ()->
        $('#pcommitReport').focus()
      $('#pcommitReport').focus()

      $('.showBgColor').css('min-width',$(window).width())
      Session.set "pcommentIndexNum", Session.get('focusedIndex')
    'click .post_header .post_abstract .abstract_chapter a' :(e)->
      $showPosts = $('.showPosts')
      $('.showPosts').get(0).style.overflow = ''
      $('.showPosts').get(0).style.maxHeight = ''
      $('.showPosts').get(0).style.position = ''
      $('.readmore').remove()
      if $('.sCurrent').length
        scrolltop=$('.sCurrent').offset().top
        document.body.scrollTop = scrolltop
    'click .postLinkItem' :(e)->
      window.location.href=this.urlinfo
    'click .postTextItem' :(e)->
      if withSectionMenu
        # console.log('clicked on textdiv ' + this._id)
        # $self = $('#'+this._id)
        $self = $(e.currentTarget)
        toolbar = $self.data('toolbarObj')
        unless toolbar
          self = this
          $self.toolbar
            content: '.section-toolbar'
            position: 'bottom'
            hideOnClick: true
          $self.on 'toolbarItemClick',(event,buttonClicked)->
            sectionToolbarClickHandler(self,event,buttonClicked)
          $self.data('toolbarObj').show()
    'click #ViewOnWeb' :->
      if Session.get("postContent").fromUrl
        if Meteor.isCordova
          Session.set("isReviewMode","undefined")
          prepareToEditorMode()
          PUB.page '/add'
          handleAddedLink(Session.get("postContent").fromUrl)
        else
          window.location.href=Session.get("postContent").fromUrl
    'click #shareStoryBtn' :->
      Session.set('isRecommendStory',true)
      trackEvent("shareStoryBtn","WebRecommendStory")
      PUB.page '/recommendStory'
    'click #sendEmail' :->
      $('.sendAuthorEmail,.authorEmailAlertBackground').fadeIn(300)
    'click #sendEmailBtn_INVALID' :(e,t)->
      mailAddress = t.find('#authorEmail').val()
      content = t.find('#sendContent').val()
      post = Session.get("postContent")
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)
      if !mailValueReg.test(mailAddress) and !qqValueReg.test(mailAddress)
        toastr.info('请输入正确的QQ号或Email')
        return false
      if qqValueReg.test(mailAddress)
        mailAddress += '@qq.com'
      if content is ''
        toastr.info('请输入私信内容')
        return false
      if Meteor.user()
        if Meteor.user().profile.fullname
          username = Meteor.user().profile.fullname
        else
          username = Meteor.user().username
        userId = Meteor.user()._id
        userIcon = Meteor.user().profile.icon
      else
        username = '匿名'
        userId = 0
        userIcon = ''
      $("#sendContent").val('')
      doc = {
        user: userId
        userName: username
        userIcon: userIcon
        email: mailAddress
        ownerId: post.owner
        content: content
        postId: post._id
        title: post.title
        addontitle: post.addontitle
        mainImage: post.mainImage
      }
      Meteor.call('personalLetterSendEmailFeedback',doc)
      $('.sendAuthorEmail,.authorEmailAlertBackground').hide();
      trackEvent("PrivateMsgAuthor","Private Msg author")
    'click #SubscribeAuthor': ->
      Session.set('subscribeAutorPageType', 'click')
      $('.subscribeAutorPage').show()
    'click .userDashboard,.authorInfoIcon':->
      Session.set("ProfileUserId1", this.owner)
      Session.set("currentPageIndex",-1)
      Meteor.subscribe("userinfo", this.owner)
      Meteor.subscribe("recentPostsViewByUser", this.owner)
      onUserProfile()
    "click .showPostsFollowMe span a":->
      if Meteor.isCordova
        cordova.plugins.clipboard.copy('故事贴')
        PUB.toast('请在微信中搜索关注公众号“故事贴”(已复制到粘贴板)')
        return
      if isIOS
        window.location.href="http://mp.weixin.qq.com/s?__biz=MzAwMjMwODA5Mw==&mid=209526606&idx=1&sn=e8053772c8123501d47da0d136481583#rd"
      if isAndroidFunc()
        window.location.href="weixin://profile/gh_5204adca97a2"
    "click .change":->
      RC = Session.get("RC")+1
      if RC>7
         RC=0
      Session.set("RC", RC)
    'click #finish':->
      if PopUpBox
        PopUpBox.close()
      else
        $('.popUpBox').hide 0
    "click #submit":->
      $("#new-reply").submit()

      # here need to subscribe refcomments again, otherwise cannot get refcomments data
      Meteor.subscribe "refcomments", ()->
        Meteor.setTimeout ()->
          refComment = RefComments.find()
          if refComment.count() > 0
            Session.set("refComment",refComment.fetch())
      if PopUpBox
        PopUpBox.close()
      else
        $('.popUpBox').hide 0
    "submit .new-reply": (event)->
      # This function is called when the new task form is submitted
      content = event.target.comment.value
      console.log content
      if content is ""
        return false

      FollowPostsId = Session.get("FollowPostsId")
      postId = Session.get("postContent")._id
      if Meteor.user()
        if Meteor.user().profile.fullname
          username = Meteor.user().profile.fullname
        else
          username = Meteor.user().username
        userId = Meteor.user()._id
        userIcon = Meteor.user().profile.icon
      else
        username = '匿名'
        userId = 0
        userIcon = ''
      try
        Comment.insert {
          postId:postId
          content:content
          username:username
          userId:userId
          userIcon:userIcon
          createdAt: new Date()
        }
        FollowPosts.update {_id: FollowPostsId},{$inc: {comment: 1}}
      catch error
        console.log error
      event.target.comment.value = ""
      $("#comment").attr("placeholder", "说点什么")
      $("#comment").css('height', 'auto')
      $('.contactsList .head').fadeOut 300
      false
    'focus .commentArea':->
      console.log("#comment get focus");
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(true)
    'blur .commentArea':->
      console.log("#comment lost focus");
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(false)
    'click .showPosts .forward' :->
      postId = Session.get("postContent")._id
      postBack = Session.get("postBack")
      postForward = Session.get("postForward")
      postForwardId = postForward.pop()
      postBack.push(postId)
      Session.set('postContentTwo', postForwardId)
      Session.set("postForward",postForward)
      Session.set("postBack",postBack)

      Session.set("pcommetsId","")
      Session.set("pcommentsName","")
      $(window).children().off()
      $(window).unbind('scroll')
      if postForwardId isnt undefined
        Router.go '/posts/' + postForwardId
      # history.forward()
    'click .showPosts .back' :->
      postId = Session.get("postContent")._id
      postBack = Session.get("postBack")
      postForward = Session.get("postForward")
      postBackId = postBack.pop()
      postForward.push(postId)
      Session.set('postContentTwo', postBackId)
      Session.set("postForward",postForward)
      Session.set("postBack",postBack)
      Session.set("pcommetsId","")
      Session.set("pcommentsName","")
      # Session.set("historyForwardDisplay", true)
      $(window).children().off()
      $(window).unbind('scroll')
      if postBackId isnt undefined
        Router.go '/posts/' + postBackId
      # history.back()
    'click #edit': (event)->
      #Clear draft first
      Drafts.remove({})
      #Prepare data from post
      fromUrl = ''
      if this.fromUrl and this.fromUrl isnt ''
        fromUrl = this.fromUrl
      draft0 = {_id:this._id, type:'image', isImage:true, url: fromUrl, owner: Meteor.userId(), imgUrl:this.mainImage, filename:this.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0,style:this.mainImageStyle}
      Drafts.insert(draft0)
      pub = this.pub;
      if pub.length > 0
        for i in [0..(pub.length-1)]
          Drafts.insert(pub[i])
      Session.set 'isReviewMode','2'
      #Don't push showPost page into history. Because when save posted story, it will use Router.go to access published story directly. But in history, there is a duplicate record pointing to this published story.
      Router.go('/add')
    'click #unpublish': (event)->
      self = this
      navigator.notification.confirm('取消发表的故事将会被转换为草稿。', (r)->
        if r isnt 2
          return
        #PUB.page('/user')
        fromUrl = ''
        if self.fromUrl and self.fromUrl isnt ''
          fromUrl = self.fromUrl
        draft0 = {_id:self._id, type:'image', isImage:true, url:fromUrl ,owner: Meteor.userId(), imgUrl:self.mainImage, filename:self.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0}
        self.pub.splice(0, 0, draft0);
        if Posts.find({owner: Meteor.userId()}).count() is 1
          Session.setPersistent('persistentMyOwnPosts',null)
          Session.setPersistent('myPostsCount',0)
        postId = self._id
        userId = Meteor.userId()
        drafts = {
          _id:postId,
          pub:self.pub,
          title:self.title,
          fromUrl:fromUrl,
          addontitle:self.addontitle,
          mainImage: self.mainImage,
          mainText: self.mainText,
          owner:userId,
          createdAt: new Date(),
        }
        Meteor.call 'unpublishPosts',postId,userId,drafts
        Router.go('/user')
        return
      , '取消发表故事', ['取消','取消发表']);


    'click #report': (event)->
      Router.go('reportPost')
    'click .postImageItem': (e)->
      swipedata = []
      i = 0
      selected = 0
      console.log "=============click on image index is: " + this.index
      for image in Session.get('postContent').pub
        if image.imgUrl
          if image.imgUrl is this.imgUrl
            selected = i
          swipedata.push
            href: image.imgUrl
            title: image.text
          i++
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
        loopAtEnd: false
      }
  Template.postFooter.helpers
    refcomment:->
      RC = Session.get 'RC'
      RefC = Session.get("refComment")
      if RefC
        return RefC[RC].text
    heart:->
      Session.get("postContent").heart.length
    retweet:->
      Session.get("postContent").retweet.length
    comment:->
      Session.get("postContent").commentsCount
      #Comment.find({postId:Session.get("postContent")._id}).count()
    blueHeart:->
      heart = Session.get("postContent").heart
      if Meteor.user()
        if JSON.stringify(heart).indexOf(Meteor.userId()) is -1
          return false
        else
          return true
      else
        return amplify.store( Session.get("postContent")._id)
    blueRetweet:->
      retweet = Session.get("postContent").retweet
      if JSON.stringify(retweet).indexOf(Meteor.userId()) is -1
        return false
      else
        return true
  heartOnePost = ->
    Meteor.subscribe "refcomments", ()->
      Meteor.setTimeout ()->
        refComment = RefComments.find()
        if refComment.count() > 0
          Session.set("refComment",refComment.fetch())
    if Meteor.user()
      postId = Session.get("postContent")._id
      FollowPostsId = Session.get("FollowPostsId")
      heart = Session.get("postContent").heart
      if JSON.stringify(heart).indexOf(Meteor.userId()) is -1
        heart.sort()
        heart.push {userId: Meteor.userId(),createdAt: new Date()}
        Posts.update {_id: postId},{$set: {heart: heart}}
        FollowPosts.update {_id: FollowPostsId},{$inc: {heart: 1}}
        return
    else
      postId = Session.get("postContent")._id
      heart = Session.get("postContent").heart
      heart.sort()
      heart.push {userId: 0,createdAt: new Date()}
      Posts.update {_id: postId},{$set: {heart: heart}}
      amplify.store(postId,true)
  onComment = ->
    window.PopUpBox = $('.popUpBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        Session.set('displayCommentInputBox',false)
      onOpen: ->
        Session.set('displayCommentInputBox',true)
        Meteor.setTimeout ->
            $('.commentArea').focus()
          ,300
        console.log 'Modal opened'
  onRefresh = ->
    RC = Session.get("RC")+1
    if RC>7
       RC=0
    Session.set("RC", RC)
  unless Meteor.isCordova
    if isIOS
      Template.postFooter.events
        'touchstart .refresh':onRefresh
        'touchstart .comment':onComment
        'touchstart .heart':heartOnePost
  Template.postFooter.events
    'click .refresh':onRefresh
    'click .comment':onComment
    'click .heart':heartOnePost
    'click .retweet':->
      if Meteor.user()
        postId = Session.get("postContent")._id
        FollowPostsId = Session.get("FollowPostsId")
        retweet = Session.get("postContent").retweet
        if JSON.stringify(retweet).indexOf(Meteor.userId()) is -1
          retweet.sort()
          retweet.push {userId: Meteor.userId(),createdAt: new Date()}
          Posts.update {_id: postId},{$set: {retweet: retweet}}
          FollowPosts.update {_id: FollowPostsId},{$inc: {retweet: 1}}
          return
    'click .blueHeart':->
      Meteor.subscribe "refcomments", ()->
          Meteor.setTimeout ()->
            refComment = RefComments.find()
            if refComment.count() > 0
              Session.set("refComment",refComment.fetch())
      if Meteor.user()
        postId = Session.get("postContent")._id
        FollowPostsId = Session.get("FollowPostsId")
        heart = Session.get("postContent").heart
        if JSON.stringify(heart).indexOf(Meteor.userId()) isnt -1
          arr = []
          for item in heart
            if item.userId isnt Meteor.userId()
              arr.push {userId:item.userId,createdAt:item.createdAt}
          Posts.update {_id: postId},{$set: {heart: arr}}
          FollowPosts.update {_id: FollowPostsId},{$inc: {heart: -1}}
          return
    'click .blueRetweet':->
      if Meteor.user()
        postId = Session.get("postContent")._id
        FollowPostsId = Session.get("FollowPostsId")
        retweet = Session.get("postContent").retweet
        if JSON.stringify(retweet).indexOf(Meteor.userId()) isnt -1
          arr = []
          for item in retweet
            if item.userId isnt Meteor.userId()
              arr.push {userId:item.userId,createdAt:item.createdAt}
          Posts.update {_id: postId},{$set: {retweet: arr}}
          FollowPosts.update {_id: FollowPostsId},{$inc: {retweet: -1}}
          return
  Template.pCommentsList.helpers
      time_diff: (created)->
        GetTime0(new Date() - created)
      hasPcomments: ->
         i = Session.get "pcommentIndexNum"
         post = Session.get("postContent").pub
         if post and post[i] and post[i].pcomments isnt undefined
           return true
         else
           return false
      pcomments:->
         i = Session.get "pcommentIndexNum"
         post = Session.get("postContent").pub
         if post[i] isnt undefined
           return post[i].pcomments
         else
           return ''

  Template.pCommentsList.events
      'click #pcommitReportBtn':(e, t)->
        i = Session.get "pcommentIndexNum"
        content = $('#pcommitReport').val()
        postId = Session.get("postContent")._id
        post = Session.get("postContent").pub

        if (favp = FavouritePosts.findOne({postId: postId, userId: Meteor.userId()}))
          FavouritePosts.update({_id: favp._id}, {$set: {updateAt: new Date()}})
        else
          FavouritePosts.insert({postId: postId, userId: Meteor.userId(), createdAt: new Date(), updateAt: new Date()})

#        if withSponserLinkAds
#          position = 1+(post.length/2)
#        if i > position then i -= 1 else i = i
        if content is ""
          $('.showBgColor').removeAttr('style')
          $('.showBgColor').css('min-width',$(window).width())
          $(window).scrollTop(0-Session.get('backgroundTop'))
          $('.pcommentsList,.alertBackground').fadeOut 300
          return false
        if Meteor.user()
          if Meteor.user().profile.fullname
            username = Meteor.user().profile.fullname
          else
            username = Meteor.user().username
          userId = Meteor.user()._id
          userIcon = Meteor.user().profile.icon
        else
          username = '匿名'
          userId = 0
          userIcon = ''
        if not post[i].pcomments or post[i].pcomments is undefined
          pcomments = []
          post[i].pcomments = pcomments
        pcommentJson = {
          content:content
          username:username
          userId:userId
          userIcon:userIcon
          createdAt: new Date()
        }
        post[i].pcomments.push(pcommentJson)
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"pcomments","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
        $('#pcommitReport').val('')
        $("#pcommitReport").attr("placeholder", "评论")
        #$('.showBgColor').removeAttr('style')
        $(window).scrollTop(0-Session.get('backgroundTop'))
        $('.pcommentsList,.alertBackground').fadeOut 300
        false


  Template.pcommentInput.helpers
      placeHolder:->
        placeHolderText = '评论'
        if Session.get("pcommetsReply")
           i = Session.get "pcommentIndexNum"
           post = Session.get("postContent").pub
           selectedIndex = Session.get("pcommentSelectedIndex")
           if post and post[i] and post[i].pcomments isnt undefined
              pcomments = post[i].pcomments
              if pcomments[selectedIndex] isnt undefined
                toUsername = pcomments[selectedIndex].username
                placeHolderText = '回复'+toUsername+':'
         return placeHolderText
      time_diff: (created)->
        GetTime0(new Date() - created)
      hasPcomments: ->
         i = Session.get "pcommentIndexNum"
         post = Session.get("postContent").pub
         if post and post[i] and post[i].pcomments isnt undefined
           return true
         else
           return false
      pcomments:->
         i = Session.get "pcommentIndexNum"
         post = Session.get("postContent").pub
         if post[i] isnt undefined
           return post[i].pcomments
         else
           return ''

#  Template.pcommentInput.events
#      'click #pcommitReportBtn':(e, t)->
#        i = Session.get "pcommentIndexNum"
#        content = $('#pcommitReport').val()
#        postId = Session.get("postContent")._id
#        post = Session.get("postContent").pub
#        if content is ""
#          $('body').removeAttr('style')
#          $(window).scrollTop(0-Session.get('backgroundTop'))
#          $('.pcommentInput,.alertBackground').fadeOut 300
#          return false
#        if Meteor.user()
#          if Meteor.user().profile.fullname
#            username = Meteor.user().profile.fullname
#          else
#            username = Meteor.user().username
#          userId = Meteor.user()._id
#          userIcon = Meteor.user().profile.icon
#        else
#          username = '匿名'
#          userId = 0
#          userIcon = ''
#        if not post[i].pcomments or post[i].pcomments is undefined
#          pcomments = []
#          post[i].pcomments = pcomments
#        pcommentJson = {
#          content:content
#          username:username
#          userId:userId
#          userIcon:userIcon
#          createdAt: new Date()
#        }
#        post[i].pcomments.push(pcommentJson)
#        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"pcomments","pindex":i}}, (error, result)->
#          if error
#            console.log(error.reason);
#          else
#            console.log("success");
#        )
#        $('#pcommitReport').val("")
#        $("#pcommitReport").attr("placeholder", "评论")
#        #$('body').removeAttr('style')
#        $(window).scrollTop(0-Session.get('backgroundTop'))
#        $('.pcommentInput,.alertBackground').fadeOut 300
#        refreshPostContent()
#        false
  Template.SectionReviewBox.helpers
    clickedCommentOverlayThumbsUp:()->
      if Session.get("clickedCommentOverlayThumbsUp") is true
        true
      else
        false
    clickedCommentOverlayThumbsDown:()->
      if Session.get("clickedCommentOverlayThumbsDown") is true
        true
      else
        false
    displaySectionReviewBox:()->
      Session.get('displaySectionReviewBox')
  Template.SectionReviewBox.events
    'click #overlayPcommitReportBtn' :(e)->
      i = Session.get('focusedIndex')
      content = $('#overlayPcommitReport').val()
      clickUp = Session.get("clickedCommentOverlayThumbsUp")
      clickDown = Session.get("clickedCommentOverlayThumbsDown")
      if content isnt "" or clickUp is true or clickDown is true
        if clickUp is true and content is ""
          commentOverlayThumbsUpHandler(i)
        if clickDown is true and content is ""
          commentOverlayThumbsDownHandler(i)
        if content isnt "" and clickUp is false and clickDown is false
          pcommentReportHandler(i,content)
        if content isnt "" and clickUp is true
          pcommentReportHandler(i,content)
        if content isnt "" and clickDown is true
          pcommentReportHandler(i,content)
        $('body').removeAttr('style')
        if PopUpBox
          PopUpBox.close()
        $('#overlayPcommitReport').val("")
        amplify.store('section_'+Session.get('channel'),true)
        Meteor.setTimeout ->
            Session.set("clickedCommentOverlayThumbsUp",false)
            Session.set("clickedCommentOverlayThumbsDown",false)
          ,3000
        refreshPostContent()
        toastr.success('您对本段文字引用的评价已生效')
      else
        toastr.success('请对此段文字进行评价')
    'click .commentOverlayLater' :(e)->
      amplify.store('section_'+Session.get('channel'),true)
      $('body').removeAttr('style')
      if PopUpBox
        PopUpBox.close()
    'click .thumbsUp' :(e)->
      if Session.get("clickedCommentOverlayThumbsUp") is true
        Session.set("clickedCommentOverlayThumbsUp",false)
      else
        if Session.get("clickedCommentOverlayThumbsDown") is true
          Session.set("clickedCommentOverlayThumbsUp",true)
          Session.set("clickedCommentOverlayThumbsDown",false)
        else
          Session.set("clickedCommentOverlayThumbsUp",true)
    'click .thumbsDown' :(e)->
      if Session.get("clickedCommentOverlayThumbsDown") is true
        Session.set("clickedCommentOverlayThumbsDown",false)
      else
        if Session.get("clickedCommentOverlayThumbsUp") is true
          Session.set("clickedCommentOverlayThumbsUp",false)
          Session.set("clickedCommentOverlayThumbsDown",true)
        else
          Session.set("clickedCommentOverlayThumbsDown",true)

  Template.pcommentInputPrompt.events
    'click .deleteComment':(e)->
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      i = Session.get "pcommentIndexNum"
      pcomments = post[i].pcomments
      index = Session.get('pcommentSelectedIndex')
      pcomments.splice( index, 1 )
      Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"pcomments","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
            postItem = $('.post-pcomment-current-pub-item')
            console.log postItem
            offsetHeight = postItem.height() - parseInt(postItem.attr('data-height'))
            console.log offsetHeight
            # resize nex node top
            postItem.nextAll().each ->
              try
                item = $(this)
                top = offsetHeight + item.position().top
                item.css 'top', top + 'px'
              catch e
                console.log 'error:' + e
            postItem.removeClass 'post-pcomment-current-pub-item'
      )
      $('.pcommentInputPromptPage').hide()
    'click .bg, click .cancleBtn':->
      $('.pcommentInputPromptPage').hide()

  Template.SubscribeAuthor.onRendered ->
    Meteor.subscribe 'follower'
  Template.SubscribeAuthor.helpers
    hasType: (val)->
      return Session.equals('subscribeAutorPageType', val)
    oldMail: ->
      postId = Session.get("postContent")._id
      post = Posts.findOne()
      followMailAddr = Meteor.user().profile.followMailAddr
      follower = Follower.findOne({userId: Meteor.userId(), followerId: post.owner})
      userEmail = if follower then follower.userEmail else ''
      if userEmail
        return userEmail
      else if followMailAddr
        return followMailAddr
      else
        return ''
  Template.SubscribeAuthor.events
    'click .okBtn':(e,t)->
      mailAddress = t.find('#email').value
      if Session.set('postContentTwo')
        postId = Session.set('postContentTwo')
      else
        postId = Session.get("postContent")._id
      # postId = Session.get("postContent")._id
      post = Posts.findOne({_id: postId})
      followerCount = Follower.find({followerId: post.owner, userId: Meteor.userId(),userEmail: {$exists: true}}).count()
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)
      # 处理已经关注时， 可以输入空的Email
      if followerCount >0 and mailAddress is ''
        mailAddress = null
      else
        if !mailValueReg.test(mailAddress) and !qqValueReg.test(mailAddress)
          toastr.remove()
          toastr.info('请输入正确的QQ号或Email')
          # $('#email').focus()
          return false
      if qqValueReg.test(mailAddress)
        mailAddress += '@qq.com'
      # 例外处理， 多个用户用同一Email关注同一作者
      followerEmailCount = Follower.find({followerId: post.owner, userEmail: mailAddress}).count()
      # 在这里处理提交部分
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      # 重复关注处理
      if followerCount > 0
        beforeEmail = Follower.find({followerId: post.owner, userId: Meteor.userId()}).userEmail
        if beforeEmail is mailAddress
          $('.subscribeAutorPage').hide()
          return toastr.info('您已经关注了作者:'+post.ownerName,'已关注')
      if followerEmailCount > 0
        $('.subscribeAutorPage').hide()
        return toastr.info('您已经关注了作者:'+post.ownerName,'已关注')
      # 用户已经关注了作者
      if followerCount > 0
        upFollowId = Follower.findOne({followerId: post.owner,userId: Meteor.userId()})._id
        Follower.update {
          _id: upFollowId
        },
        {
          $set:{
            userEmail: mailAddress
            fromWeb: true
          }
        }
      # 用户第一次关注该作者
      else
        Follower.insert {
          userId: Meteor.userId()
          #这里存放fullname
          userName: username
          userIcon: Meteor.user().profile.icon
          userDesc: Meteor.user().profile.desc
          # 存放关注者的Email
          userEmail: mailAddress
          followerId: post.owner
          #这里存放fullname
          followerName: post.ownerName
          followerIcon: post.ownerIcon
          followerDesc: ''
          # 存放关注来源
          fromWeb: true
          createAt: new Date()
        }
      # 更新USER中的followMailAddr
      if mailAddress and mailAddress isnt Meteor.user().profile.followMailAddr
        Meteor.users.update {
          _id: Meteor.userId()
        },{
          $set:{'profile.followMailAddr': mailAddress}
        }
      $('.subscribeAutorPage').hide()
      if mailAddress
        toastr.success('您已成功关注该作者'+post.ownerName+'，确认邮件将很快（10分钟左右）送达，谢谢！','关注成功')
        trackEvent("Following","Email Follower")
    'click .cannelBtn, click .bg':->
      $('.subscribeAutorPage').hide()

    Template.recommendStory.onRendered ->
      $('body').css('overflow-y','hidden')
      Session.set('storyListsLimit',10)
      Session.set('storyListsLoaded',false)
      Session.set('storyListsType','publishedStories')
      $.rippleButton();
    Template.recommendStory.onDestroyed ->
      $('body').css('overflow-y','auto')
      Session.set('isRecommendStory',false)
    Template.recommendStory.helpers
      storyListsLoaded: ()->
        if Session.get('storyListsType') is 'publishedStories'
          return Session.get('storyListsLoaded') is true
        else
          return favouritepostsCollection_getmore is 'done'
      isStoryListsLoadedAll: ()->
        if Session.get('storyListsType') is 'publishedStories'
          return Session.get('storyListsCounts') < Session.get('storyListsLimit')
        else
          return FavouritePosts.find({userId: Meteor.userId()}).count() < Session.get("favouritepostsLimit")
      storyLists:()->
        if Session.get('storyListsType') is 'publishedStories'
          posts = Posts.find({owner: Meteor.userId()})
        else
          postIds = []
          FavouritePosts.find({userId: Meteor.userId()}).forEach((item) ->
            if !~postIds.indexOf(item.postId)
              postIds.push(item.postId)
          )
          posts = Posts.find({_id: {$in: postIds}})
        return posts
      getFirstParagraph:(pub)->
        text = ''
        if !pub
          return ''
        for i in [1..pub.length-1]
          if pub[i].type is 'text'
            if pub[i].isHyperlink
              text = pub[i].hyperlinkText
            else
              text = pub[i].text
          if text? and text isnt ''
            break
        return text
    Template.recommendStory.events
      'click .leftButton':(e)->
        return window.history.back()
      'click #importBtn': (e)->
        originUrl = $('#importUrl').val()
        console.log('originUrl=='+originUrl)
        if originUrl is ''
          return toastr.info('请输入或粘贴一个链接~')
        # 判断url格式
        urlReg = new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi")
        if !originUrl.match(urlReg)
          return toastr.info('链接格式错误~')
        # 调用导入相关方法
        url = '/import-server/' + Meteor.userId() + '/' + encodeURIComponent(originUrl)
        console.log('url=='+url)
        $('.importing-mask,.importing').show()
        HTTP.get url,(error, result)->
          if !error
            data = result.content
            if result.statusCode is 200 and Session.get('postContent')._id
              data = data.split("\n")
              data = JSON.parse(data[data.length-1])
              storyId = data.json.split("/")
              storyId = storyId[storyId.length-1]
              console.log("data is ==",data)
              console.log("storyId is ==",storyId)
              $('.importing-mask,.importing').hide()
              # 推荐到读友圈
              toastr.remove()
              Meteor.call 'pushRecommendStoryToReaderGroups', Session.get('postContent')._id, storyId, (err)->
                if !err
                  toastr.info('推荐成功！')
                  return window.history.back()
                else
                  console.log('pushRecommendStoryToReaderGroups:', err)
                  toastr.info('推荐失败~')
            else
              data = result.content
              console.log("data is ==",data)
              $('.importing-mask,.importing').hide()
          else
            toastr.info('导入失败，请重试！')
      'click .storyLists li':(e)->
        console.log('target_postId=='+e.currentTarget.id)
        # 准备分享到相关读友圈
        groups = []
        if Session.get('postContent')._id
          # 推荐到读友圈
          toastr.remove()
          Meteor.call 'pushRecommendStoryToReaderGroups', Session.get('postContent')._id, e.currentTarget.id, (err)->
            if !err
              toastr.info('推荐成功！')
              return window.history.back()
            else
              console.log('pushRecommendStoryToReaderGroups:', err)
              toastr.info('推荐失败~')
      'click #loadMore': (e)->
        if Session.get('storyListsType') is 'publishedStories'
          limit = parseInt(Session.get('storyListsLimit'))
          limit += 10
          Session.set('storyListsLimit',limit)
        else
          favouritepostsLimit = Session.get('favouritepostsLimit')
          favouritepostsLimit += 10
          Session.set('favouritepostsLimit',favouritepostsLimit)
        Session.set('storyListsLoaded',false)
      'click .storySource .radio': (e)->
        Session.set('storyListsType',e.currentTarget.id)
