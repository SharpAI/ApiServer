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
    console.log("show post rev 2")
    base_size=($( window ).width()/6 - 10);
    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], resize: {enabled: false }}).data('gridster');`
    gridster.disable()
    window.lastScroll = 0;
    $("img.lazy").lazyload();
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
    isMyPost:->
      post = Posts.find({_id:this._id}).fetch()[0] 
      if post.owner is Meteor.userId()
        true
      else
        false
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
    'click #socialShare': (event)->
      current = Router.current();
      url = current.url;
      if url.indexOf("http") > 0
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      window.plugins.socialsharing.share(this.title+':'+this.addontitle+'(来自 故事贴)', null, null, url);
    'click .imgdiv': (e)->
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