if Meteor.isClient
  Template.discover.helpers
    NoMoments:()->
      if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
        false
      else
        true
    hasDiscover: ()->
      withDiscover
  Template.moments.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'discover'
        console.log "moments window scroll event: "+event
        target = $("#showMoreMomentsResults");
        MOMENTS_ITEMS_INCREMENT = 10;
        console.log "target.length: " + target.length
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();
        console.log "threshold: " + threshold
        console.log "target.top: " + target.offset().top
        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("momentsitemsLimit",
                Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.moments.helpers
    NoMoments:()->
      if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
        false
      else
        true
    moments:()->
      DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1}})
    time_diff: (created)->
      GetTime0(new Date() - created)
    moreResults:()->
      if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
        !(DynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
      else
        false
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')
  Template.moments.events
    'click .readpost':(e)->
      postId = this.readPostId
      if postId is undefined
        postId = this._id
      $(window).children().off()
      $(window).unbind('scroll')
      id = Session.get("postContent")._id
      PUB.postPage(id)
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/redirect/'+postId
      ,300
  Template.lpcomments.helpers
    lpcomments:()->
      Feeds.find({followby:Meteor.userId(),checked:false},{sort: {createdAt: -1}})
    time_diff: (created)->
      GetTime0(new Date() - created)
  Template.lpcomments.events
    'click .readpost':(e)->
      postId = this.postId
      Feeds.update({_id:this._id},{$set: {checked:true}})
      id = Session.get("postContent")._id
      if postId isnt id
        $(window).children().off()
        $(window).unbind('scroll')
        PUB.postPage(id)
        Meteor.setTimeout ()->
          Session.set("Social.LevelOne.Menu",'contactsList')
          Router.go '/redirect/'+postId
        ,300
