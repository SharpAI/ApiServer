Meteor.startup(function () {
  if (Meteor.isServer) {
    var DEBUG_ON = false;

    Accounts.onLogin(function(info){
      DEBUG_ON && console.log('onLogin:')
      if(info && info.user && info.user.profile && info.user.profile.device){
        console.log('Device: '+info.user.username+' --> login')
        //user = Meteor.users.findOne({username: uuid)
        userGroups = SimpleChat.GroupUsers.findOne({user_id: info.user._id})
        console.log(userGroups)
        sharpai_pushnotification("device_online",userGroups,info.user.username)
        cancel_offline_notification(info.user.username);
        info.connection.onClose(function(){
          console.log('Device: '+info.user.username+' --> disconnected')
          Meteor.users.update(
            {username:info.user.username},
            {$unset:{"services.resume.loginTokens":[]}
          })
          create_offline_notification(info.user.username,{})
        })
      }
      if(info.user){
        if(info.connection && info.connection.clientAddress){
            Meteor.users.update({_id:info.user._id},{$set:{'profile.lastLogonIP':info.connection.clientAddress}})
            LogonIPLogs.insert({userid: info.user._id, ip: info.connection.clientAddress, createdAt: new Date()})
        }
      }
    })

    Accounts.validateLoginAttempt(function(options) {

      if(options.user && options.user.token){
        if( LockedUsers.find({token: options.user.token}).count() > 0 ) {
          throw new Meteor.Error(403, "设备被禁用")
        }
      }
      if(options.allowed){
        return true;
      }
      DEBUG_ON && console.log(options);
      var username = options.methodArguments[0].user.username
      var password = options.methodArguments[0].password.digest
      DEBUG_ON && console.log('username: ')
      DEBUG_ON && console.log(username)
      DEBUG_ON && console.log('password: ')
      DEBUG_ON && console.log(password)
      DEBUG_ON && console.log(options.methodArguments[0].password)
      var real_pwd = CryptoJS.HmacSHA256(username, "sharp_ai98&#").toString()
      var real_pwd_digest = CryptoJS.SHA256(real_pwd).toString()
      if(real_pwd_digest === password){
        var userInfo = Meteor.users.findOne({username:username});
        if(userInfo){
          Accounts.setPassword(userInfo._id,real_pwd);
          Meteor.users.update({_id:userInfo._id},{$set:{'profile.device':true}})
        } else {
          DEBUG_ON && console.log('need create user')
          var result = Accounts.createUser({
            username:username,
            password:{
              digest: real_pwd_digest,
              algorithm: 'sha-256'
            },
            profile:{
              device: true
            }
          })
          console.log(result)
          DEBUG_ON && console.log(result)
        }
      }
      return true;
    })
  }
})
