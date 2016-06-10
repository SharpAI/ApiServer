if (Meteor.isServer) {
  Accounts.registerLoginHandler('userId', function(options) {
    if(!options.userId || options.userId === '' || !options.loginUserId || options.loginUserId === '')
      return undefined;
    if(!Meteor.users.findOne({_id: options.userId}))
      throw new Meteor.Error(403, 'User not found');
    
    if(AssociatedUsers.find({$or: [{userIdA: options.userId, userIdB: options.loginUserId}, {userIdA: options.loginUserId, userIdB: options.userId}]}).count() > 0)
      return {userId: options.userId};
    throw new Meteor.Error(403, 'User not found');
  });
}