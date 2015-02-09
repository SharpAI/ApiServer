#space 2
if Meteor.isClient
  Template.home.helpers
    isCordova:()->
      Meteor.isCordova
  Template.home.events
    'click #follow': (event)->
       Router.go '/searchFollow'
