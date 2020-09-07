if Meteor.isServer
  Meteor.startup ()->
    # 禁止相关设备创建用户
    Accounts.validateNewUser (user)->
      if user.token
        if LockedUsers.find({token: user.token}).count() > 0
          throw new Meteor.Error(403, "设备被禁用")
      # 禁止匿名登录(only mobile)
      ###
      console.log('create='+JSON.stringify(user.profile))
      if user and user.profile and user.profile.anonymous is true
        if user.profile.browser is true
          return true
        else
          throw new Meteor.Error(403, "不能匿名登录")
      else
      ###
      return true
