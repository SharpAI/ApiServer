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
      if(Groups.find({_id: to}).count() <= 0){
        Groups.insert({
          _id: to,
          name: '',
          icon: '',
          describe: '',
          create_time: new Date(),
          last_text: '',
          last_time: new Date()
        }, function(err, id){
          GroupUsers.insert({
            group_id: id,
            group_name: '',
            group_icon: '',
            user_id: slef.userId,
            user_name: AppConfig.get_user_name(user),
            user_icon: AppConfig.get_user_icon(user),
            create_time: new Date()
          });
        });
      }else{
        var group = Groups.findOne({_id: to});
        if(GroupUsers.find({group_id: to, user_id: slef.userId}).count() <= 0){
          GroupUsers.insert({
            group_id: to,
            group_name: '',
            group_icon: '',
            user_id: slef.userId,
            user_name: AppConfig.get_user_name(user),
            user_icon: AppConfig.get_user_icon(user),
            create_time: new Date()
          });
        }
      }

      return [
        Groups.find({_id: to}),
        // Messages.find(where, {limit: limit || 20, sort: {create_time: -1}})
      ];
  }
});

Meteor.publish('get-group', function(id){
  return Groups.find({_id: id});
});