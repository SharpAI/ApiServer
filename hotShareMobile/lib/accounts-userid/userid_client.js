if (Meteor.isClient) {
  Meteor.loginWithUserId = function (userId, callback) {
    var lastLoginWithUserIdTime = localStorage.getItem('login-with-user-id-last-time');
    if(lastLoginWithUserIdTime && (new Date()).getTime() - (new Date(lastLoginWithUserIdTime)).getTime() <= 10000)
      return callback && callback('WAIT_TIME');
    
    var loginUserId = Meteor.userId();
    if(!loginUserId)
      return callback && callback('NOT_LOGIN');
    
    Meteor.logout(function (err) {
      if(err && Meteor.userId())
        return callback && callback('RESET_LOGIN');
      else if(err && !Meteor.userId())
        return callback && callback('NOT_LOGIN');
      
      Accounts.callLoginMethod({
        methodArguments: [{userId: userId, loginUserId: loginUserId}],
        userCallback: function (err) {
          if (err)
            return callback && callback('NOT_LOGIN');
            
          localStorage.setItem('login-with-user-id-last-time', new Date());
          return callback && callback();
        }
      });
    })
  };
}