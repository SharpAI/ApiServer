if Meteor.isClient
  Template.listPosts.rendered=->
    switchFooterMenu('home')
    $('.content').css 'min-height',$(window).height()
#    $('.mainImage').css('height',$(window).height()*0.55)
    $(window).scroll (event)->
        target = $("#showMoreResults");
        FOLLOWPOSTS_ITEMS_INCREMENT = 10;
        if (!target.length)
            return;

        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                console.log("target became visible (inside viewable area)");
                target.data("visible", true);
                Session.set("followpostsitemsLimit",
                Session.get("followpostsitemsLimit") + FOLLOWPOSTS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                console.log("target became invisible (below viewable arae)");
                target.data("visible", false);
  Template.listPosts.helpers
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    myPosts:()->
      followPostsDetails = FollowPosts.find({followby:Meteor.userId()}, {sort: {createdAt: -1}}).fetch()
      if undefined != followPostsDetails
        hour = 1000 * 60 * 60
        for d, i in followPostsDetails
          # we need browse count, comment cound and heart count for new homepage, so need to subscribe publicPosts here
          Meteor.subscribe("publicPosts", d.postId)
          postDetails = Posts.findOne({_id: d.postId})
          if postDetails
            followPostsDetails[i].browse = postDetails.browse or 0
            followPostsDetails[i].comment = postDetails.commentsCount or 0
            followPostsDetails[i].heart = postDetails.heart.length
            followPostsDetails[i].createdAt = GetTime0(new Date() - postDetails.createdAt)
          else
            followPostsDetails[i].browse = "loading..."
            followPostsDetails[i].comment = "loading..."
            followPostsDetails[i].heart = "loading..."
            followPostsDetails[i].createdAt = "loading..."
      return followPostsDetails
    moreResults:->
      !(FollowPosts.find().count() < Session.get("followpostsitemsLimit"))
    loading:->
      Session.equals('followPostsCollection','loading')
    loadError:->
      Session.equals('followPostsCollection','error')
  Template.listPosts.events
    'click .mainImageBox': (event)->
      if isIOS
        if (event.clientY + $('.home #footer').height()) >=  $(window).height()
          console.log 'should be triggered in scrolling'
          return false
      $('.home').addClass('animated ' + animateOutLowerEffect);
      postId = this.postId
      Meteor.setTimeout ()->
        PUB.page '/posts/'+postId
      ,animatePageTrasitionTimeout
      console.log this.postId
      Session.set 'FollowPostsId',this._id
      console.log this._id
