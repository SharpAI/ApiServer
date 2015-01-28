if Meteor.isClient
  Template.search.helpers
    theme:()->
      Topics.find({type:"theme"}, {sort: {createdAt: -1}})
    topic:()->
      Topics.find({type:"topic"}, {sort: {createdAt: -1}})
  Template.search.events
    'click .back': (event)->
       history.back()
    'click #follow': (event)->
       Router.go '/searchFollow'
    'click .theme': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", @text
       Router.go '/topicPosts'
    'click .topic': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text
       Router.go '/topicPosts'
  Template.searchFollow.helpers
    follows: ->
      Follows.find()
    isFollowed:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if fcount > 0
        true
      else
        false
