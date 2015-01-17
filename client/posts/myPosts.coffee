if Meteor.isClient
  Template.allPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
  Template.myPosts.helpers
    items:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
      #for i in [0..Posts.find({owner: Meteor.userId()}).count()-1]
      #  Posts.find({owner: Meteor.userId()}).fetch()[i]
  Template.myPosts.events
    'click .back':(event)->
        PUB.back()
        return
    'click img':(e)->
        PUB.page('/posts/'+this.id);
        Session.set 'FollowPostsId',this._id
        return