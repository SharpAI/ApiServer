if Meteor.isClient
  Template.perfShow.events
    'click .perfShow .leftButton':(e, t)->
       history.back()
