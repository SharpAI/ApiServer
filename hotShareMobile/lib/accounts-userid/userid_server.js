if (Meteor.isServer) {
  Accounts.registerLoginHandler('userId', function(options) {
    if(!options.userId || options.userId === '')
      return undefined;
    if(!this.userId)
      throw new Meteor.Error(403, 'Sorry,you are currently logged out.');
    if(!Meteor.users.findOne({_id: options.userId}))
      throw new Meteor.Error(403, 'User not found');
    
    if(AssociatedUsers.find({$or: [{userIdA: options.userId, userIdB: this.userId}, {userIdA: this.userId, userIdB: options.userId}]}).count() > 0)
      return {userId: options.userId};
  });
}