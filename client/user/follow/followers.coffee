#space 2
if Meteor.isClient
  Template.followers.helpers
    followers:->
      Follows.find({}, {sort: {createdAt: -1}})
  Template.followers.events
    'click .back' :->
      Router.go '/user'