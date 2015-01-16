if Meteor.isClient
  Template.listPosts.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.addontitle').css('top',$(window).height()*0.25)
  Template.listPosts.helpers
    myPosts:()->
      FollowPosts.find({followby:Meteor.userId()}, {sort: {createdAt: -1}})
  Template.listPosts.events
    'click .mainImage': (event)->
      Router.go '/posts/'+this.postId
      console.log this.postId
      Session.set 'FollowPostsId',this._id
      console.log this._id