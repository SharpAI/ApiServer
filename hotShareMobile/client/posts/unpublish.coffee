if Meteor.isClient
  Template.unpublish.events
    'click .back':(event)->
      Router.go('/')