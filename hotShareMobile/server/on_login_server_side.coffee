if Meteor.isServer
  Accounts.onLogin (object)->
    # if Anonymous user with default icon, changed to a better one.
    if object.user
      if object.user.profile and object.user.profile.anonymous and (object.user.profile.icon is '/userPicture.png')
        randomI = parseInt(Math.random()*33+1)
        icon = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + randomI + '.png'
        Meteor.users.update {_id:object.user._id},{$set:{'profile.icon':icon}}
      if object.connection and object.connection.clientAddress
        Meteor.users.update {_id:object.user._id},{$set:{'profile.lastLogonIP':object.connection.clientAddress}}
