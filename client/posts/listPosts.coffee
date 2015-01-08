if Meteor.isClient
  Template.listPosts.helpers
    myPosts:()->
      Posts.find({owner:Meteor.userId()});
  Template.listPosts.events
    'click .item': (event)->
      Router.go('/posts/'+this._id);
