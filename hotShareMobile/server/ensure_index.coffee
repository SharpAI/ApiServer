if Meteor.isServer
  Meteor.startup ()->
    Viewers._ensureIndex({postId: 1})