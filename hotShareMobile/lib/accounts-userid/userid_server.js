if (Meteor.isServer) {
  Accounts.registerLoginHandler('userId', function(options) {
    if(!options.userId || options.userId === '')
      return undefined;
    if(!this.userId)
      throw new Meteor.Error(403, 'Sorry,you are currently logged out.');
    if(!Meteor.users.findOne({_id: options.userId}))
      throw new Meteor.Error(403, 'User not found');
    
    var auser = AssociatedUsers.findOne({$or: [{userIdA: this.userId}, {userIdB: this.userId}]});
    if(!auser)
      throw new Meteor.Error(403, 'User not found');
      
    if(auser.userIdA === this.userId){
      if(AssociatedUsers.find({userIdA: this.userId, userIdB: options.userId}).count() > 0)
        return {userId: options.userId};
    }else{
      if(AssociatedUsers.find({userIdA: auser.userIdA, userIdB: options.userId}).count() > 0)
        return {userId: options.userId};
    }
    
    throw new Meteor.Error(403, 'User not found');
  });
}