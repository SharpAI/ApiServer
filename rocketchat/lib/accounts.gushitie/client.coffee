if Meteor.isClient
  Meteor.loginWithGushitie = (userId, callback)->
    Accounts.callLoginMethod({
        methodArguments: [{userId: userId}]
        userCallback: (err, res)->
          callback and callback(err, res)
      }
    )