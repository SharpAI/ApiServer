if Meteor.isClient
  Template.listPosts.rendered=->
    $('.title').css('top',$(window).height()*0.15)
    $('.addontitle').css('top',$(window).height()*0.25)
  Template.listPosts.helpers
    myPosts:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
  Template.listPosts.events
    'click .item': (event)->
      Router.go '/posts/'+this._id
