if Meteor.isClient
  Meteor.loginWithAnonymous = (uuid, callback)->
    Accounts.callLoginMethod(
      methodArguments: [{uuid: uuid}]
      userCallback: (err, res)->
        url = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + parseInt(Random.fraction()*33+1) + '.png'
        Meteor.call 'setAvatarFromService', url, '', 'url'
        
        callback and callback(err, res)
    )