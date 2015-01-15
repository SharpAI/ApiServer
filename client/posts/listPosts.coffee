if Meteor.isClient
  Template.listPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.addontitle').css('top',$(window).height()*0.25)
  Template.listPosts.helpers
    myPosts:()->
      Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
  Template.listPosts.events
    'click .mainImage': (event)->
      Router.go '/posts/'+this._id
