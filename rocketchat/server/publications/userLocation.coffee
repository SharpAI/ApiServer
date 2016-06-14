Meteor.publish 'userLocation', (usernames)->
  RocketChat.models.Users.find { username: $in: usernames },
    fields:
      username:1
      'profile.location':1
