if Meteor.isClient
  window.getDocHeight = ->
    D = document
    Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight)
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight)
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    )
  Template.showPosts.rendered=->
    Session.set 'isSharing',false
    #`global_disable_longpress = true`
    postContent = Session.get("postContent")
    browseTimes = 0
    if (postContent.browse != undefined)
      browseTimes = postContent.browse + 1
    else
      browseTimes = 1
    Posts.update(
      {_id:postContent._id},
      {$set:{
          browse:browseTimes,
        }
      }
    )
    $('p').linkify();
    $("a[target='_blank']").click((e)->
      e.preventDefault();
      window.open($(e.currentTarget).attr('href'), '_system', '');
    )

    $('.showPosts').css('min-height',$(window).height())
    window.title = this.title + ':' + this.addontitle
    console.log("show post rev 2 "+window.title)
    base_size=($( window ).width()/6 - 10);
    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], resize: {enabled: false }}).data('gridster');`
    gridster.disable()
    window.lastScroll = 0;
    $(window).scroll (event)->
      #Sets the current scroll position
      st = $(window).scrollTop();

      if(st + $(window).height() is window.getDocHeight())
        $('.showPosts .head').fadeIn 300
        $('#postFooter').fadeIn 300
        window.lastScroll = st
        return
      # Changed is too small
      if Math.abs(window.lastScroll - st) < 10
        return
      #Determines up-or-down scrolling
      if st > window.lastScroll
        $('.showPosts .head').fadeOut 300
        $('#postFooter').fadeOut 300
      else
        $('.showPosts .head').fadeIn 300
        $('#postFooter').fadeIn 300
      #Updates scroll position
      window.lastScroll = st

  Template.showPosts.helpers
    isSharing: ()->
      Session.get 'isSharing'
    time_diff: (created)->
      GetTime0(new Date() - created)
    isMyPost:->
      if Posts.find({_id:this._id}).count() > 0
        post = Posts.find({_id:this._id}).fetch()[0]
        if post.owner is Meteor.userId()
          return true
      return false
    isMobile:->
      Meteor.isCordova
  Template.showPosts.events
    'click .back' :->
      #for tmpPage in history
      #  console.log "showPosts, tmpPage = "+JSON.stringify(tmpPage)
      #history.back()
      PUB.back()
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
      for i in [0..(pub.length-1)]
        #if i is 0
        #  pub[0].imgUrl = this.mainImage
        Drafts.insert(pub[i])
      Session.set 'isReviewMode','2'
      PUB.page('/add')
    'click #unpublish': (event)->
      self = this
      navigator.notification.confirm('你确定取消分享吗？', (r)->
        if r is 2
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
      , '取消分享', ['确定','取消']);


    'click #socialShare': (event)->
      current = Router.current();
      url = current.url;
      if url.indexOf("http") > 0
        url = url.replace("meteor.local", "120.24.244.253");
      else
        url = "http://120.24.244.253"+url;
      title = this.title;
      addontitle = this.addontitle;
      console.log "socialsharing: this.mainImage="+this.mainImage
      Session.set 'isSharing',true
      downloadFromBCS(this.mainImage, (result)->
        if result is null
          console.log("downloadFromBCS failed!")
          PUB.toast("准备故事的主题图片失败，请稍后尝试。");
          Session.set 'isSharing',false
          return
        console.log("downloadFromBCS suc! Prepare socialsharing...")
        window.plugins.socialsharing.share(title+':'+addontitle+'(来自 故事贴)', null, result, url);
        Session.set 'isSharing',false
      )
    'click .imgdiv': (e)->
      images = []
      swipedata = []

      #swipedata.push
      #  href: Session.get('postContent').mainImage
      #  title: Session.get('postContent').title
      #i = 1
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
      #$(document.body).on('click','#swipebox-slider .current', ->
      #  $('#swipebox-close').trigger('click')
      #)
  Template.postFooter.helpers
    heart:->
      Session.get("postContent").heart.length
    retweet:->
      Session.get("postContent").retweet.length
    comment:->
      Comment.find({postId:Session.get("postContent")._id}).count()
    blueHeart:->
      heart = Session.get("postContent").heart
      if JSON.stringify(heart).indexOf(Meteor.userId()) is -1
        return false
      else
        return true
    blueRetweet:->
      retweet = Session.get("postContent").retweet
      if JSON.stringify(retweet).indexOf(Meteor.userId()) is -1
        return false
      else
        return true
      
  Template.postFooter.events
    'click .commentList':->
      $('#showComment').css('display',"block")
      $('.showPosts').css('height',$(window).height())
    'click .comment':->
      $('#showComment').css('display',"block")
      $('.showPosts').css('height',$(window).height())
    'click .heart':->
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
