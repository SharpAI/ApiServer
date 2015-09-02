if Meteor.isClient
  Template.topicPosts.onCreated ()->
    Meteor.subscribe("topics")
    Meteor.subscribe("topicposts")
  Template.topicPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.addontitle').css('top',$(window).height()*0.25)
  Template.topicPosts.helpers
    TopicTitle:()->
      Session.get('topicTitle')
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    Posts:()->
      TopicPosts.find({topicId:Session.get('topicId')}, {sort: {createdAt: -1}})
  Template.topicPosts.events
    'click .back':(event)->
      $('.home').addClass('animated ' + animateOutUpperEffect);
      Meteor.setTimeout ()->
        PUB.back()
      ,animatePageTrasitionTimeout
    'click .mainImage': (event)->
      Session.set("postPageScrollTop", 0)
      if isIOS
        if (event.clientY + $('#footer').height()) >=  $(window).height()
          console.log 'should be triggered in scrolling'
          return false
      postId = this.postId
      $('.home').addClass('animated ' + animateOutUpperEffect);
      Meteor.setTimeout ()->
        PUB.page '/posts/'+postId
      ,animatePageTrasitionTimeout
      Session.set 'FollowPostsId',this._id
      return
