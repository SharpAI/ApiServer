if Meteor.isClient
  Meteor.loginWithAnonymous = (uuid, callback)->
    Accounts.callLoginMethod(
      methodArguments: [{uuid: uuid}]
      userCallback: (err, res)->
        callback and callback(err, res)
    )