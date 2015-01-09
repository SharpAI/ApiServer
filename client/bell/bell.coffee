if Meteor.isClient
  Template.bell.helpers
    eventFeeds:->
      Feeds.find({owner:Meteor.userId()})
    selfPosted:(eventType)->
      eventType is 'SelfPosted'