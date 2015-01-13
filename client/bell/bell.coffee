if Meteor.isClient
  Template.bell.helpers
    eventFeeds:->
      Feeds.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
    selfPosted:(eventType)->
      eventType is 'SelfPosted'
    time_diff: (created)->
      GetTime0(new Date() - created)