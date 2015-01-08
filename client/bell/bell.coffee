if Meteor.isClient
  Template.bell.helpers
    eventFeeds:->
      [{eventType:'SelfPost',postId:'ShwaHK5SdE85g9SKS',postTitle:'Hi'}
      {eventType:'SelfPost',postId:'ShwaHK5SdE85g9SKS',postTitle:'Hi'}]
    selfPosted:(eventType)->
      eventType is 'SelfPost'