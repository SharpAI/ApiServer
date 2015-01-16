if Meteor.isClient
  Template.allPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
  Template.allPosts.helpers
    myPosts:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
  Template.allPosts.events
    'click .leftButton':(event)->
        PUB.back()
    'click .mainImage': (event)->
      Router.go '/posts/'+this._id
      Session.set 'FollowPostsId',this._id
