if Meteor.isClient
  Template.myPosts.helpers
    items:()->
      for i in [0..Posts.find({owner: Meteor.userId()}).count()-1]
        Posts.find({owner: Meteor.userId()}).fetch()[i]
  Template.myPosts.events
    'click .back':(event)->
        PUB.back()
        return
    'click img':(e)->
        PUB.page('/posts/'+e.currentTarget.id);
        return