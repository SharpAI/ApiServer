if Meteor.isServer
  Meteor.startup ()->
    # 禁止相关用户登录
    Accounts.validateLoginAttempt (object)->
      if object.user and object.user.token
        if LockedUsers.find({token: object.user.token}).count() > 0
          throw new Meteor.Error(403, "设备被禁用")
      return true
    Accounts.onLogin (object)->
      # if Anonymous user with default icon, changed to a better one.
      if object.user
        ###
        Since All anonymose name were changed on server side, no need to check it every time.
        if object.user.profile and object.user.profile.anonymous
          if object.user.profile.icon is '/userPicture.png'
            randomI = parseInt(Math.random()*33+1)
            icon = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + randomI + '.png'
            Meteor.users.update {_id:object.user._id},{$set:{'profile.icon':icon}}
          if object.user.profile.fullname is '匿名'
            newName = getRandomAnonymousName()
            if newName and newName isnt ''
              Meteor.users.update {_id:object.user._id},{$set:{'profile.fullname':newName}}
        ###
        if object.connection and object.connection.clientAddress
          Meteor.users.update {_id:object.user._id},{$set:{'profile.lastLogonIP':object.connection.clientAddress}}
          LogonIPLogs.insert({userid: object.user._id, ip: object.connection.clientAddress, createdAt: new Date()})
