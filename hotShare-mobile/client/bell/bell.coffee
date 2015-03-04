if Meteor.isClient
  Template.bell.helpers
    eventFeeds:->
      Feeds.find({}, {sort: {createdAt: -1}})
    isComment:(eventType)->
      eventType is 'comment'
    selfPosted:(eventType)->
      eventType is 'SelfPosted'
    time_diff: (created)->
      GetTime0(new Date() - created)
  Template.bell.events
    'click #follow': (event)->
       Router.go '/searchFollow'
