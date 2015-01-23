#space 2
if Meteor.isClient
  Template.home.helpers
    isCordova:()->
      Meteor.isCordova