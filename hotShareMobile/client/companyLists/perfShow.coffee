if Meteor.isClient
  Template.perfShow.helpers
    reportUrl: ()->
      Session.get('reportUrl')
    title: ()->
      return Session.get('perfShowTitle') || '绩效展示'
  Template.perfShow.events
    'click .perfShow .leftButton':(e, t)->
       history.back()
