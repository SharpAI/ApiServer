if Meteor.isClient
  Template.search.helpers
    theme:()->
      Topics.find({type:"theme"}, {sort: {createdAt: -1}})
    topic:()->
      Topics.find({type:"topic"}, {sort: {createdAt: -1}})
