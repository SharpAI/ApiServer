Meteor.publish('get-messages', function(type, to){
  var slef = this;
  var user = Meteor.users.findOne(slef.userId);
  var where = null;

  if(type === 'group')
    where = {'to.id': to, to_type: type}; // 没有判断是否在群的处理。自动加群
  else
    where = {
      $or: [
        {'form.id': slef.userId, 'to.id': to, to_type: type}, // me -> ta
        {'form.id': to, 'to.id': slef.userId, to_type: type}  // ta -> me
      ]
    };

  switch(type){
    case 'user':
      return [
        Meteor.users.find({_id: to}),
        // Messages.find(where, {limit: limit || 20, sort: {create_time: -1}})
      ];
    case 'group':
      Meteor.call('create-group', to, null, []);
      return [
        Groups.find({_id: to}, {limit: 1}),
        // Messages.find(where, {limit: limit || 20, sort: {create_time: -1}})
      ];
  }
});

Meteor.publish('get-msg-session', function(){
  return MsgSession.find({user_id: this.userId}, {limit: 20});
});

Meteor.publish('get-group', function(id){
  return Groups.find({_id: id});
});

Meteor.publish('get-my-group', function(user_id){
  return GroupUsers.find({user_id: user_id});
});
