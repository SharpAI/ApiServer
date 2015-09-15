if Meteor.isClient
  Template.redirect.rendered = ->
    post = ClientPosts.findOne({_id: Session.get('nextPostID')})
    if post
      Router.go '/post/'+Session.get('nextPostID')
    else
      Router.go '/posts/'+Session.get('nextPostID')
