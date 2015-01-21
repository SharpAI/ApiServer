if Meteor.isClient
  window.getDocHeight = ->
    D = document
    Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight)
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight)
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    )
  Template.showPosts.rendered=->
#    $('.mainImage').css('height',$(window).height()*0.55)
    $('.showPosts').css('min-height',$(window).height())
#    $('.title').css('top',$(window).height()*0.25)
#    $('.addontitle').css('top',$(window).height()*0.35)
    window.title = this.title + ':' + this.addontitle

    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [40, 40],widget_margins: [5, 5], resize: {enabled: false }}).data('gridster');`
    gridster.disable()
    window.lastScroll = 0;

    $(window).scroll (event)->
      #Sets the current scroll position
      st = $(window).scrollTop();

      if(st + $(window).height() is window.getDocHeight())
        $('.head').fadeIn 300
        $('#postFooter').fadeIn 300
        window.lastScroll = st
        return
      # Changed is too small
      if Math.abs(window.lastScroll - st) < 10
        return
      #Determines up-or-down scrolling
      if st > window.lastScroll
        $('.head').fadeOut 300
        $('#postFooter').fadeOut 300
      else
        $('.head').fadeIn 300
        $('#postFooter').fadeIn 300
      #Updates scroll position
      window.lastScroll = st

  Template.showPosts.helpers
    time_diff: (created)->
      GetTime0(new Date() - created)
  Template.showPosts.events
    'click .back' :->
      history.back()
    'click #socialShare': (event)->
      current = Router.current();
      url = current.url;
      if url.indexOf("http") > 0
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      window.plugins.socialsharing.share(this.title+':'+this.addontitle+'(来自 故事贴)', null, null, url);
    'click .img': (e)->
      images = []
      swipedata = []
      i = 0
      selected = 0
      for image in Session.get('postContent').pub
        if image.imgUrl is this.imgUrl
          selected = i
        if image.imgUrl
          swipedata.push
            href: image.imgUrl
            title: image.text
        i++
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
      }
      $(document.body).on('click','#swipebox-slider .current', ->
        $('#swipebox-close').trigger('click')
      )
  Template.postFooter.helpers
    heart:->
      Session.get("postContent").heart.length
    retweet:->
      Session.get("postContent").retweet.length
    comment:->
      Session.get("postContent").comment.length
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
    'click .comment':->
      $('#showComment').css('display',"block")
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
              arr push {userId:item.userId,createdAt:item.createdAt}
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
              arr push {userId:item.userId,createdAt:item.createdAt}
          Posts.update {_id: postId},{$set: {retweet: arr}}
          FollowPosts.update {_id: FollowPostsId},{$inc: {retweet: -1}}
          return