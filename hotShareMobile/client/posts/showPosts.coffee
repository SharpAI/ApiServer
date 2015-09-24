if Meteor.isClient
  @baseGap = 5
  @baseFont = 18
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
        Meteor.subscribe "viewers",Session.get("postContent")._id
      ,500
  onUserProfile = ->
    @PopUpBox = $('.popUpBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        Session.set('displayUserProfileBox',false)
      onOpen: ->
        Session.set('displayUserProfileBox',true)
  Template.showPosts.onDestroyed ->
    $('.tool-container').remove()
    if $('.tts-stoper').is(':visible')
      $('.tts-stoper').hide()
      TTS.stop()
  Template.showPosts.onRendered ->
    calcPostSignature(window.location.href.split('#')[0]);
    if Session.get("postPageScrollTop") isnt undefined and Session.get("postPageScrollTop") isnt 0
      Meteor.setTimeout ()->
          document.body.scrollTop = Session.get("postPageScrollTop")
        , 280
  Template.showPosts.onDestroyed ()->
    if gridster
      gridster.destroy()
    Session.set('postfriendsitemsLimit', 10)
  Template.showPosts.rendered=->
    Session.setDefault "toasted",false
    Session.set('postfriendsitemsLimit', 10);
    $('.mainImage').css('height',$(window).height()*0.55)
    $('.comment').css('width',$(window).width()-120)
    postContent = Session.get("postContent")
    subscribeCommentAndViewers()
    browseTimes = 0
    Session.set("Social.LevelOne.Menu",'discover')
    Session.set("SocialOnButton",'postBtn')
    if (postContent.browse != undefined)
      browseTimes = postContent.browse + 1
    else
      browseTimes = 1
    if not Meteor.isCordova
      favicon = document.createElement('link');
      favicon.id = 'icon';
      favicon.rel = 'icon';
      favicon.href = postContent.mainImage;
      document.head.appendChild(favicon);
    Meteor.setTimeout ()->
        Posts.update(
          {_id:postContent._id},
          {$set:{
              browse:browseTimes,
            }
          }
        )
      ,1000
    $('.textDiv1Link').linkify();
    $("a[target='_blank']").click((e)->
      e.preventDefault();
      #window.open($(e.currentTarget).attr('href'), '_system', '');
      if Meteor.isCordova
        Session.set("isReviewMode","undefined")
        prepareToEditorMode()
        PUB.page '/add'
        handleAddedLink($(e.currentTarget).attr('href'))
      else
        window.open($(e.currentTarget).attr('href'), '_blank', 'hidden=no,toolbarposition=top')
    )

    $('.showBgColor').css('min-height',$(window).height())
    base_size=Math.floor($('#test').width()/6 - baseGap*2);

    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], min_cols: 3, max_cols:6, resize: {enabled: false },draggable:{long_press:false}}).data('gridster');`
    gridster.disable()

    $("#test").find('.hastextarea').each( ( i, itemElem )->
      textdiv = $(itemElem).children('.textdiv')
      textarea = $(textdiv).children('.textDiv1')

      min_widget_height = (baseGap * 2) + base_size;

      scrollHeight = $(textarea).prop('scrollHeight') - baseFont*2
      sizey = Math.ceil((scrollHeight + baseGap * 2)/min_widget_height)

      sizex = $(itemElem).attr("data-sizex")
      sizey_orig = parseInt($(itemElem).attr("data-sizey"))

      if sizey isnt sizey_orig
        $(itemElem).attr("data-sizey", sizey)
        gridster.resize_widget($(itemElem), sizex,sizey)
      height = sizey*min_widget_height - baseGap * 2
      $(itemElem).css("line-height", height+'px')
      $(itemElem).css("height", height+'px')
    )
    hidePostBar = ()->
      if $('.showPostsFooter').is(':visible')
        $('.showPostsFooter').fadeOut 300
#      if $('.showPosts .head').is(':visible')
#        $('.showPosts .head').fadeOut 300
    showPostBar = ()->
      unless $('.showPostsFooter').is(':visible')
        $('.showPostsFooter').fadeIn 300
#      unless $('.showPosts .head').is(':visible')
#        $('.showPosts .head').fadeIn 300

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

      # comment these two lines to show head on userProfile page
      # if $('.userProfile .head').is(':visible')
        # $('.userProfile .head').fadeOut 300

      if $('.socialContent .chatFooter').is(':visible')
        $('.socialContent .chatFooter').fadeOut 300
    scrollEventCallback = ()->
      #Sets the current scroll position
      st = $(window).scrollTop()
      if st is 0
        showSocialBar()
#        hideSocialBar()
#        showPostBar()
        unless $('.showPosts .head').is(':visible')
          $('.showPosts .head').fadeIn 300
        window.lastScroll = st
        return

      if window.lastScroll - st > 5
        $('.showPosts .head').fadeIn 300
        showSocialBar()
      if window.lastScroll - st < -5
        $('.showPosts .head').fadeOut 300
        displaySocialBar = $(".socialContent #socialContentDivider").isAboveViewPortBottom();
        if displaySocialBar
          showSocialBar()
        else
          hideSocialBar()
      if(st + $(window).height()) is window.getDocHeight()
#        hidePostBar()
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
        if Session.equals("Social.LevelOne.Menu",'discover')
          Session.set("SocialOnButton",'discover')
        if Session.equals("Social.LevelOne.Menu",'contactsList')
          Session.set("SocialOnButton",'contactsList')
#        hidePostBar()
      else
        #showSocialBar()
        if $('.contactsList .head').is(':visible')
          $('.contactsList .head').fadeOut 300
        Session.set("SocialOnButton",'postBtn')
#        hideSocialBar()
#        showPostBar()
      #Updates scroll position
      window.lastScroll = st
    window.lastScroll = 0;
#    $('.socialContent .chatFooter').css('display', 'none')
    #hideSocialBar()
    #showPostBar()

    if withSocialBar
      $(window).scroll(scrollEventCallback)
    #if !$('body').isSupportObjectFit()
    #  PUB.toast("您的手机版本过低，部分图片可能产生变形。");

  Template.showPosts.helpers
    withSectionMenu: withSectionMenu
    withSectionShare: withSectionShare
    withPostTTS: withPostTTS
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
    getStyle:->
      self=this
      pclength=0
      if self.pcomments
        pclength=self.pcomments.length
      userId=Session.get("pcommetsId")
      userName=Session.get("pcommentsName")
      scolor="#F30B44"
      if userId and userId isnt ""
        if self.likeUserId and self.likeUserId[userId] is true
          scolor="#304EF5"
        if scolor is "#F30B44" and self.dislikeUserId and self.dislikeUserId[userId] is true
          scolor="#304EF5"
        if scolor is "#F30B44" and pclength>0
          for icomment in self.pcomments
            if icomment["userId"] is userId
              scolor="#304EF5"
              break
      if scolor is "#304EF5" and Session.get("toasted") is false
        Session.set "toasted",true
        PUB.toast(userName+"点评过的段落将为您用蓝色标注！")
      dislikeSum = 0
      if self.dislikeSum
        dislikeSum=self.dislikeSum
      likeSum=0
      if self.likeSum
        likeSum=self.likeSum
      if dislikeSum + likeSum + pclength is 0
        self.style
      else
        if self.style is undefined or self.style.length is 0
          "color: "+scolor+";"
        else
          self.style.replace("grey",scolor).replace("rgb(128, 128, 128)",scolor).replace("rgb(0, 0, 0)",scolor).replace("#F30B44",scolor)
    isTextLength:(text)->
      if(text.trim().length>0)
        return true
      else
        return false
    myselfClickedUp:->
      i = this.index
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].likeUserId[userId] is true
        return true
      else
        return false
    myselfClickedDown:->
      i = this.index
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].dislikeUserId[userId] is true
        return true
      else
        return false
    getPub:->
      self = this
      self.pub = self.pub || []
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
    plike:->
      if this.likeSum is undefined
        0
      else
        this.likeSum
    pdislike:->
      if this.dislikeSum is undefined
        0
      else
        this.dislikeSum
    pcomments:->
      if this.pcomments is undefined
        0
      else
        this.pcomments.length
  thumbsUpHandler=(e,self)->
    if e.target.className is "fa fa-thumbs-up thumbsUp"
      e.target.className="fa fa-thumbs-o-up thumbsUp"
      e.target.textContent=e.target.textContent-1
    else
      e.target.className="fa fa-thumbs-up thumbsUp"
      e.target.textContent=e.target.textContent-0+1
      if e.target.nextElementSibling.className is "fa fa-thumbs-down thumbsDown"
        e.target.nextElementSibling.className = "fa fa-thumbs-o-down thumbsDown"
        e.target.nextElementSibling.textContent=e.target.nextElementSibling.textContent-1
    Meteor.defer ()->
      i = self.index
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()
      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] is true and  post[i].likeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] is true and  post[i].dislikeUserId[userId] isnt true
        post[i].likeSum -= 1
        post[i].likeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        triggerToolbarShowOnThumb($(e.target))
        return
  thumbsDownHandler = (e,self)->
    if e.target.className is "fa fa-thumbs-down thumbsDown"
      e.target.className="fa fa-thumbs-o-down thumbsDown"
      e.target.textContent=e.target.textContent-1
    else
      e.target.className="fa fa-thumbs-down thumbsDown"
      e.target.textContent=e.target.textContent-0+1
      if e.target.previousElementSibling.className is "fa fa-thumbs-up thumbsUp"
        e.target.previousElementSibling.className = "fa fa-thumbs-o-up thumbsUp"
        e.target.previousElementSibling.textContent=e.target.previousElementSibling.textContent-1
    Meteor.defer ()->
      i = self.index
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()
      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] isnt true and  post[i].likeUserId[userId] is true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        post[i].likeSum -= 1
        post[i].likeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] isnt true and  post[i].dislikeUserId[userId] is true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        triggerToolbarShowOnThumb($(e.target))
        return
      #addDynamicTemp()
  triggerToolbarShowOnThumb = ($node)->
    $node.parent().click()
  sectionToolbarClickHandler = (self,event,node)->
    console.log('Index ' + self.index + ' Action ' + $(node).attr('action') )
    action = $(node).attr('action')
    if action is 'section-forward'
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
    else if action is 'post-tts'
      pub = Session.get("postContent").pub
      toRead = []
      for i in [self.index..(pub.length-1)]
        if pub[i].type is 'text' and pub[i].text and pub[i].text isnt ''
          toRead.push(pub[i].text )
      if toRead.length > 0
        $('.tts-stoper').show()
        async.mapLimit(toRead,1,(item,callback)->
            TTS.speak {
                text: item,
                locale: 'zh-CN',
                rate: 1.5
              }
            ,()->
              if $('.tts-stoper').is(':visible')
                callback(null,item)
              else
                callback(new Error('Stopped'),item)
            ,(reason)->
              callback(new Error(reason),item)
        ,(err,result)->
          console.log('Err ' + err + ' Result ' + result);
          $('.tts-stoper').hide()
        );
      else
        window.plugins.toast.showShortCenter("并未选中可读的段落");
  Template.showPosts.events
    'click .tts-stoper' : ()->
      Meteor.defer ()->
        $('.tts-stoper').hide()
        TTS.stop()
    'click .textdiv' :(e)->
      if withSectionMenu
        console.log('clicked on textdiv ' + this._id)
        $self = $('#'+this._id)
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
    'click .user':->
      Session.set("ProfileUserId1", this.owner)
      Session.set("currentPageIndex",-1)
      Meteor.subscribe("userinfo", this.owner)
      Meteor.subscribe("recentPostsViewByUser", this.owner)
      onUserProfile()
      #Session.set("Social.LevelOne.Menu", 'userProfile')
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
      #setTimeout(()->
      #  $('#comment').trigger("keyup")
      #,300)
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
    'click .showPosts .back' :->
      Session.set("pcommetsId","")
      Session.set("pcommentsName","")
      $(window).children().off()
      $(window).unbind('scroll')
      $('.showPosts').addClass('animated ' + animateOutUpperEffect)
      $('.showPostsFooter').addClass('animated ' + animateOutUpperEffect)
      Meteor.setTimeout ()->
        #PUB.back()
        PUB.postPageBack()
        if Session.get("Social.LevelOne.Menu") is 'userProfile'
          Session.set("Social.LevelOne.Menu",'contactsList')
          return
      ,animatePageTrasitionTimeout
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
      #PUB.page('/add')
      Router.go('/add')
    'click #unpublish': (event)->
      self = this
      navigator.notification.confirm('取消发表的故事将会被转换为草稿。', (r)->
        if r isnt 2
          return
        #PUB.page('/user')
        Router.go('/user')
        fromUrl = ''
        if self.fromUrl and self.fromUrl isnt ''
          fromUrl = self.fromUrl
        draft0 = {_id:self._id, type:'image', isImage:true, url:fromUrl ,owner: Meteor.userId(), imgUrl:self.mainImage, filename:self.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0}
        self.pub.splice(0, 0, draft0);

        Posts.remove {
          _id:self._id
        }

        SavedDrafts.insert {
          _id:self._id,
          pub:self.pub,
          title:self.title,
          fromUrl:fromUrl,
          addontitle:self.addontitle,
          mainImage: self.mainImage,
          mainText: self.mainText,
          owner:Meteor.userId(),
          createdAt: new Date(),
        }
        return
      , '取消发表故事', ['取消','取消发表']);


    'click #report': (event)->
      Router.go('reportPost')
    'click .imgdiv': (e)->
      images = []
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
    'click .thumbsUp': (e)->
      thumbsUpHandler(e,this)
    'click .thumbsDown': (e)->
      thumbsDownHandler(e,this)
    'click .pcomments': (e)->
      backgroundTop = 0-$(window).scrollTop()
      Session.set('backgroundTop', backgroundTop);
      $('.showBgColor').attr('style','position:fixed;top:'+Session.get('backgroundTop')+'px')
      $('.pcommentsList,.alertBackground').fadeIn 300, ()->
        $('#pcommitReport').focus()
      Session.set "pcommentIndexNum", this.index
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
      positionStyle: 'absolute'
      position: [0, 0]
      onClose: ->
        Session.set('displayCommentInputBox',false)
      onOpen: ->
        Session.set('displayCommentInputBox',true)
        Meteor.setTimeout ->
            $('.commentArea').focus()
          ,300
        console.log 'Modal opened'
        $('.popUpBox').css('height', $(document).height())
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
      pcomments:->
         i = Session.get "pcommentIndexNum"
         post = Session.get("postContent").pub
         if post[i] isnt undefined
           return post[i].pcomments
         else
           return ''

  Template.pCommentsList.events
      'click .alertBackground':->
        $('.showBgColor').removeAttr('style')
        $(window).scrollTop(0-Session.get('backgroundTop'))
        $('.pcommentsList,.alertBackground').fadeOut 300
        Session.set('backgroundTop','')
      'click #pcommitReportBtn':(e, t)->
        i = Session.get "pcommentIndexNum"
        content = t.find('#pcommitReport').value
        if content is ""
          return false
        postId = Session.get("postContent")._id
        post = Session.get("postContent").pub
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

        if not post[i].pcomments
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
        t.find('#pcommitReport').value = ""
        $("#pcommitReport").attr("placeholder", "说点什么")
#        $('.pcommentsList,.alertBackground').fadeOut 300
        false
