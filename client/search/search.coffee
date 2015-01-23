if Meteor.isClient
  Template.search.helpers
    theme:()->
      Topics.find({type:"theme"}, {sort: {createdAt: -1}})
    topic:()->
      Topics.find({type:"topic"}, {sort: {createdAt: -1}})
  Template.search.events
    'click .theme': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", @text
       Router.go '/topicPosts'
    'click .topic': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text
       Router.go '/topicPosts'
