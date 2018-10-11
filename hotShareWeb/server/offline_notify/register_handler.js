Meteor.startup(function () {
  if (Meteor.isServer) {
    var DEBUG_ON = false;

    Accounts.onLogin(function(info){
      DEBUG_ON && console.log('onLogin:')
      if(info && info.user && info.user.profile && info.user.profile.device){
        console.log('Device: '+info.user.username+' --> login')
        sharpai_pushnotification("device_offline",userGroups,uuid)
        //user = Meteor.users.findOne({username: uuid)
        userGroups = SimpleChat.GroupUsers.find({user_id: info.user._id})
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
    })

    Accounts.validateLoginAttempt(function(options) {
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
