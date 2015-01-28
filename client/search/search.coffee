if Meteor.isClient
  Template.search.helpers
    theme:()->
      Topics.find({type:"theme"}, {sort: {createdAt: -1}})
    topic:()->
      Topics.find({type:"topic"}, {sort: {createdAt: -1}})
  Template.search.events
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
  Template.searchFollow.rendered=->
    Session.set('isSearching', false)
  Template.searchFollow.events
    'click .back': (event)->
       history.back()
  Template.searchFollow.helpers
    isSearching:->
      if Session.get('isSearching') is false
         false
      else
         true
    follows: ->
      Follows.find()
    isFollowed:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if fcount > 0
        true
      else
        false
    isFollowedUser:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow._id}).count()
      if fcount > 0
        true
      else
        false
    notSelf:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if follow._id is Meteor.userId()
        false
      else
        true
