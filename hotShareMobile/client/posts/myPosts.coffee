if Meteor.isClient
  Template.myPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
  Template.myPosts.helpers
    items:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
      #for i in [0..Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).count()-1]
      #  Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).fetch()[i]
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
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
