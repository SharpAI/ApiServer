if Meteor.isClient
  Template.perfShow.helpers
    reportUrl: ()->
      Session.get('reportUrl')
  Template.perfShow.events
    'click .perfShow .leftButton':(e, t)->
       history.back()
