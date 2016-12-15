if Meteor.isClient
  Template.topicPosts.onCreated ()->
    Meteor.subscribe("topics")
    Meteor.subscribe("topicposts", Session.get('topicId'), 20)
    Session.set("topicPostLimit", 20)
    Session.set('topicPostsCollection','loading')
  Template.topicPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.addontitle').css('top',$(window).height()*0.25)
    $(window).scroll (event)->
        target = $("#topicPostShowMoreResults");
        TOPIC_POSTS_ITEMS_INCREMENT = 20;

        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height()

        if target.offset().top < threshold
          if (!target.data("visible"))
              Session.set("topicPostLimit",
                          Session.get("topicPostLimit") + TOPIC_POSTS_ITEMS_INCREMENT)
              Meteor.subscribe 'topicposts', Session.get('topicId'), Session.get("topicPostLimit"), onReady: ->
                if Session.get("topicPostLimit") >= TopicPosts.find({topicId:Session.get('topicId')}).count()
                  console.log 'topicPostsCollection loaded'
                  Meteor.setTimeout (->
                    Session.set 'topicPostsCollection', 'loaded'
                    return
                  ), 500
                return
        else
          if (target.data("visible"))
              target.data("visible", false);
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
    moreResults:->
      if Session.equals('topicPostsCollection','loaded')
          false
      else
          true
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
