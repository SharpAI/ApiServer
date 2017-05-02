Meteor.methods({
  'create-group': function(id, name, ids){
    var slef = this;
    id = id || new Mongo.ObjectID()._str;
    ids = ids || [];
    var group = Groups.findOne({_id: id});

    if (!name)
      name = 'AI训练群 ' + (Groups.find({}).count() + 1);
    if(group){
      if (slef.userId && ids.indexOf(slef.userId) === -1)
        ids.push(slef.userId);
      if (ids.length > 0){
        for(var i=0;i<ids.length;i++){
          var user = Meteor.users.findOne({_id: ids[i]});
          if (user && GroupUsers.find({group_id: id, user_id: ids[i]}).count() <= 0){
            GroupUsers.insert({
              group_id: id,
              group_name: group.name,
              group_icon: group.icon,
              user_id: user._id,
              user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
              user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
              create_time: new Date()
            });
          }
        }
      }
      return id;
    }

    // console.log('ids:', ids);
    Groups.insert({
      _id: id,
      name: name,
      icon: '',
      describe: '',
      create_time: new Date(),
      last_text: '',
      last_time: new Date(),
      barcode: rest_api_url + '/restapi/workai-group-qrcode?group_id=' + id
    }, function(err){
      if(ids.indexOf(slef.userId) === -1)
        ids.splice(0, 0, slef.userId);
      // console.log('ids:', ids);
      for(var i=0;i<ids.length;i++){
        var user = Meteor.users.findOne({_id: ids[i]});
        if(user){
          // console.log(user);
          GroupUsers.insert({
            group_id: id,
            group_name: name,
            group_icon: '',
            user_id: user._id,
            user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
            user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
            create_time: new Date()
          });
        }
      }
      // sendMqttMessage('/msg/g/' + id, {
      //   _id: new Mongo.ObjectID()._str,
      //   form: {
      //     id: '',
      //     name: '系统',
      //     icon: ''
      //   },
      //   to: {
      //     id: id,
      //     name: name,
      //     icon: ''
      //   },
      //   images: [],
      //   to_type: "group",
      //   type: "system",
      //   text: '欢迎加入'+name ,
      //   create_time: new Date(),
      //   is_read: false
      // });
    });
    return id;
  },
  'add-group-urser':function(id,usersId){
    var slef = this;
    usersId = usersId || [];
    group = Groups.findOne({_id: id});
    if(group){
      if(id == 'd2bc4601dfc593888618e98f') {
          onSomeOneregistered_forTest()
      }

      if(usersId.indexOf(slef.userId) === -1){
        usersId.splice(0, 0, slef.userId);
      }
      // console.log('ids:', ids);
      for(var i=0;i<usersId.length;i++){
        var user = Meteor.users.findOne({_id: usersId[i]});
        if(user){
          var isExist = GroupUsers.findOne({group_id: group._id,user_id: user._id});
          if (isExist) {
            console.log('GroupUsers isExist');
            continue;
          }
          // console.log(user);
          GroupUsers.insert({
            group_id: group._id,
            group_name: group.name,
            group_icon: group.icon,
            user_id: user._id,
            user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
            user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
            create_time: new Date()
          });
        }
      }
      return 'succ'
    }
    else{
      return 'not find group';
    }
  },
  'remove-group-user':function(id,userId){
    var groupuser = GroupUsers.findOne({group_id: id,user_id: userId});
    if (groupuser) {
      GroupUsers.remove({_id:groupuser._id},function(err,res){
        if (err) {
          return console.log ('GroupUsers remove failed');
        }
        if (GroupUsers.find({group_id: id}).count === 0){
          Groups.remove({_id:id});
        }
      });
    }
    return id;
  }
});

// console.log('users:', GroupUsers.find({group_id: '84d27087d40b82e2a6fbc33e'}).fetch());
// GroupUsers.after.insert(function (userId, doc) {
//   var sess = MsgSession.findOne({user_id: doc.user_id, 'to.id': doc.group_id, type: 'group'});
//   if(!sess){
//     MsgSession.insert({
//       user_id: doc.user_id,
//       user_name: doc.user_name,
//       user_icon: doc.user_icon,
//       text: '群聊天',
//       update_time: new Date(),
//       msg_count: 1,
//       type: 'group',
//       to_user_id: doc.group_id,
//       to_user_name: doc.group_name,
//       to_user_icon: doc.group_icon
//     });
//   }
// });
