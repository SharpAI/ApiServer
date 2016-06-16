Meteor.methods
  getUserLocation: (username) ->
    user =  Meteor.users.findOne({'username': username})
    console.log('******'+user)
    if user isnt undefined and user.profile isnt undefined
      return user.profile.location
    else 
      return ''