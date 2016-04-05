if (Meteor.isClient) {
  Meteor.loginWithUserId = function (userId, callback) {
    callback = callback ? callback :  function(){};
    if(!Meteor.userId())
      return callback('Sorry,you are currently logged out.');
      
    Accounts.callLoginMethod({
      methodArguments: [{userId: userId}],
      userCallback: function (err, res) {
        if (err)
          return callback(err);
        return callback(null, res);
      }
    });
  };
}