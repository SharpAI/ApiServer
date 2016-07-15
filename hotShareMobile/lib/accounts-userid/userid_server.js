if (Meteor.isServer) {
  Accounts.registerLoginHandler('userId', function(options) {
    if(!options.userId)
      return undefined;
    if(!Meteor.users.findOne({_id: options.userId}))
      throw new Meteor.Error(403, 'User not found');
    if(options.isExtension)
      return {userId: options.userId};
      
    options.loginUserId = options.loginUserId || this.userId;
    if(options.version && options.version === '2.0'){
      if(UserRelation.find({userId: options.loginUserId, toUserId: options.userId}).count() > 0)
        return {userId: options.userId};
    }
    if(AssociatedUsers.find({$or: [{userIdA: options.userId, userIdB: options.loginUserId}, {userIdA: options.loginUserId, userIdB: options.userId}]}).count() > 0)
      return {userId: options.userId};
      
    throw new Meteor.Error(403, 'User not found');
  });
}