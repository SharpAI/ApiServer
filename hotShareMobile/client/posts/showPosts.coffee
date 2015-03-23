if Meteor.isClient
  commentBox = null
  deviceHeight = $(window).height()
  @isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false )
  window.getDocHeight = ->
    D = document
    Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight)
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight)
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    )
  Template.showPosts.destoryed=->
    $(window).children().off();
  Template.showPosts.rendered=->
    $('.mainImage').css('height',deviceHeight*0.55)
    postContent = Session.get("postContent")
    browseTimes = 0
    if (postContent.browse != undefined)
      browseTimes = postContent.browse + 1
    else
      browseTimes = 1
    Meteor.setTimeout ()->
        if Viewers.find({userId:Meteor.user()._id}).count() is 0
          if Meteor.user().profile.fullname is "匿名"
            username = Meteor.user().profile.fullname
          else
            username = Meteor.user().username
          try
            Viewers.insert {
              postId:postContent._id
              username:username
              userId:Meteor.user()._id
              userIcon:Meteor.user().profile.icon
              createdAt: new Date()
            }
          catch error
            console.log error
      ,1000
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
    $('p').linkify();
    $("a[target='_blank']").click((e)->
      e.preventDefault();
      window.open($(e.currentTarget).attr('href'), '_system', '');
    )

    $('.showBgColor').css('min-height',deviceHeight)
    base_size=($('#test').width()/6 - 10);

    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], min_cols: 3, max_cols:6, resize: {enabled: false },draggable:{long_press:true}}).data('gridster');`
    gridster.disable()


    $("#test").find('.hastextarea').each( ( i, itemElem )->
      textdiv = $(itemElem).children('.textdiv')
      textarea = $(textdiv).children('p')

      #offset = this.offsetHeight - this.clientHeight;
      #height = $(textarea).height()
      #width = $( window ).width()
      #5*2 is gridster gap size, 4*2 is padding
      #$(textarea).css('width', width - 10)
      $(textarea).css('height', 'auto')
      height = $(textarea).height()

      min_widget_height = (5 * 2) + base_size;
      sizey = Math.floor((height)/min_widget_height)+1

      #$(textarea).css('width', '')
      $(textarea).css('height', '')
      sizex = $(itemElem).attr("data-sizex")
      sizey_orig = parseInt($(itemElem).attr("data-sizey"))
      if sizey isnt sizey_orig
        $(itemElem).attr("data-sizey", sizey)
        gridster.resize_widget($(itemElem), sizex,sizey)
    )

    window.lastScroll = 0;
    $(window).scroll (event)->
      #Sets the current scroll position
      st = $(window).scrollTop();

      if(st + deviceHeight) is window.getDocHeight()
        $('.showPosts .head').fadeIn 300
        $('.showPostsFooter').fadeOut 300
        window.lastScroll = st
        return
      # Changed is too small
      if Math.abs(window.lastScroll - st) < 10
        return
      #Determines up-or-down scrolling
      if st > window.lastScroll
        window.popedup = false
        $('.showPosts .head').fadeOut 300
        $('.showPostsFooter').fadeOut 300
      else
        $('.showPosts .head').fadeIn 300
        $('.showPostsFooter').fadeIn 300
      #Updates scroll position
      window.lastScroll = st

  Template.showPosts.helpers
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
  Template.showPosts.events
    "click .change":->
      RC = Session.get("RC")+1
      if RC>7
         RC=0
      Session.set("RC", RC)
      #setTimeout(()->
      #  $('#comment').trigger("keyup")
      #,300)
    'click #finish':->
      if commentBox
        commentBox.close()
      else
        $('.commentInputBox').hide 0
    "click #submit":->
      $("#new-reply").submit()
      if commentBox
        commentBox.close()
      else
        $('.commentInputBox').hide 0
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
      false
    'focus .commentArea':->
      console.log("#comment get focus");
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(true)
    'blur .commentArea':->
      console.log("#comment lost focus");
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(false)
    'click .back' :->
      $('.showPosts').addClass('animated ' + animateOutUpperEffect);
      $('.showPostsFooter').addClass('animated ' + animateOutUpperEffect);
      Meteor.setTimeout ()->
        PUB.back()
      ,animatePageTrasitionTimeout
    'click #edit': (event)->
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data from post
      draft0 = {_id:this._id, type:'image', isImage:true, owner: Meteor.userId(), imgUrl:this.mainImage, filename:this.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0}
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
      navigator.notification.confirm('你确定取消分享吗？', (r)->
        if r is 1
          return
        PUB.page('/user')

        draft0 = {_id:self._id, type:'image', isImage:true, owner: Meteor.userId(), imgUrl:self.mainImage, filename:self.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0}
        self.pub.splice(0, 0, draft0);

        Posts.remove {
          _id:self._id
        }

        SavedDrafts.insert {
          _id:self._id,
          pub:self.pub,
          title:self.title,
          addontitle:self.addontitle,
          mainImage: self.mainImage,
          mainText: self.mainText,
          owner:Meteor.userId(),
          createdAt: new Date(),
        }
        return
      , '取消分享', ['取消','确定']);


    'click #report': (event)->
      Router.go('reportPost')
    'click #socialShare': (event)->
      current = Router.current();
      url = current.url;
      if url.indexOf("http") > 0
        `url = url.replace("meteor.local", server_domain_name);`
      else
        `url = "http://" + server_domain_name +url;`
      title = this.title;
      addontitle = this.addontitle;
      console.log "socialsharing: this.mainImage="+this.mainImage

      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等")

      height = $('.showPosts').height()
      $('#blur_overlay').css('height',height)
      $('#blur_overlay').css('z-index', 10000)


      downloadFromBCS(this.mainImage, (result)->
        $('#blur_overlay').css('height','')
        $('#blur_overlay').css('z-index', -1)
        if result is null
          console.log("downloadFromBCS failed!")
          PUB.toast("准备故事的主题图片失败，请稍后尝试。");
          return
        console.log("downloadFromBCS suc! Prepare socialsharing...")
        window.plugins.socialsharing.share(title+':'+addontitle+'(来自 故事贴)', null, result, url);


      )
    'click .imgdiv': (e)->
      images = []
      swipedata = []

      i = 0
      selected = 0
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
    $('.showBgColor').hide 0
    commentBox = $('.commentInputBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        $('.showBgColor').show 0,->
          $(window).scrollTop(window.lastScroll)
      onOpen: ->
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
