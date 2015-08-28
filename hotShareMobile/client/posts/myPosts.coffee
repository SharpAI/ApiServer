if Meteor.isClient
  Template.myPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
    if(Session.get("showBigImage") == undefined)
      Session.set("showBigImage",true)
    $(window).scroll (event)->
        console.log "myPosts window scroll event: "+event
        target = $("#showMoreMyPostsResults");
        MYPOSTS_ITEMS_INCREMENT = 4;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("mypostsitemsLimit",
                Session.get("mypostsitemsLimit") + MYPOSTS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.myPosts.helpers
    showBigImage:()->
      return Session.get("showBigImage")
    showRightIcon:()->
      if(Session.get("showBigImage"))
        return "fa fa-list fa-fw"
      else
        return "fa fa-th-large"
    items:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("mypostsitemsLimit")})
      #for i in [0..Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).count()-1]
      #  Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).fetch()[i]
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    moreResults:->
      !(Posts.find({owner:Meteor.userId()}).count() < Session.get("mypostsitemsLimit"))
    loading:->
      Session.equals('myPostsCollection','loading')
    loadError:->
      Session.equals('myPostsCollection','error')
  Template.myPosts.events
    'click .back':(event)->
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.back()
        ,animatePageTrasitionTimeout
    'click .mainImage':(e)->
        if isIOS
          if (event.clientY + $('#footer').height()) >=  $(window).height()
            console.log 'should be triggered in scrolling'
            return false
        postId = this._id
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.page '/posts/'+postId
        ,animatePageTrasitionTimeout
        Session.set 'FollowPostsId',this._id
        return
    'click .listView':()->
      if(Session.get("showBigImage"))
        Session.set("showBigImage",false)
        Session.set("mypostsitemsLimit",15)
      else
        Session.set("showBigImage",true)
        Session.set("mypostsitemsLimit",15)
