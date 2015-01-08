if Meteor.isClient
  Template.listPosts.helpers
    myPosts:()->
      Posts.find({owner:Meteor.userId()});