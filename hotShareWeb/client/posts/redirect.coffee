if Meteor.isClient
  Template.redirect.rendered = ->
    Router.go '/posts/'+Session.get('nextPostID')
