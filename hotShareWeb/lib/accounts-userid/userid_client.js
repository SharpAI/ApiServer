if (Meteor.isClient) {
  Meteor.loginWithUserId = function (userId,isExtension, callback) {
    callback = callback ? callback :  function(){};
    if(!Meteor.userId()&&(!isExtension || isExtension === false))
      return callback('Sorry,you are currently logged out.');
      
    Accounts.callLoginMethod({
      methodArguments: [{userId: userId,isExtension:isExtension}],
      userCallback: function (err, res) {
        if (err)
          return callback(err);
        return callback(null, res);
      }
    });
  };
}