Meteor.publish "userLocation", (usernames) ->
  user=RocketChat.models.Users.find {username: $in: usernames},
    fields:
      username: 1
      status: 1
      "profile.location": 1
      
  return user