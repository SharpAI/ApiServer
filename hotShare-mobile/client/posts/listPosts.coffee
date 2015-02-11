if Meteor.isClient
  Template.listPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.addontitle').css('top',$(window).height()*0.25)
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
      FollowPosts.find({followby:Meteor.userId()}, {sort: {createdAt: -1}})
    moreResults:->
      !(FollowPosts.find().count() < Session.get("followpostsitemsLimit"))
  Template.listPosts.events
    'click .mainImage': (event)->
      $('.home').addClass('animated ' + animateOutLowerEffect);
      postId = this.postId
      Meteor.setTimeout ()->
        PUB.page '/posts/'+postId
      ,animatePageTrasitionTimeout
      console.log this.postId
      Session.set 'FollowPostsId',this._id
      console.log this._id
