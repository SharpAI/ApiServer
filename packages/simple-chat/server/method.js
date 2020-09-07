var async =  Meteor.npmRequire('async');
AI_system_register_devices = function (group_id,uuid) {
  var ai_system_url = process.env.AI_SYSTEM_URL || 'http://aixd.raidcdn.cn/restapi/register';

  if(!group_id) {
    console.log('group_id not found');
    return;
  }

  var group = Groups.findOne({_id: group_id});
  if (group && group.companyId) {
    var company_id = group.companyId;
    function register_device(device){
        console.log('device in_out:'+device.in_out);
        HTTP.call('POST', ai_system_url, {
          data: {
              'uuid': device.uuid,
              'device_name':device.name,
              'in_out':device.in_out,
              'companyId': company_id,
              'group_id': group_id,
              'imgUrl': 'http://workaiossqn.tiegushi.com/tablet.png'  //TODO:
          }, timeout: 5*1000
        }, function(error, res) {
          if (error)
            return console.log("post device info to aixd.raidcdn failed " + error);
          else
            return console.log("registered this device to aixd.raidcdn" + error);
        });
    }
    if (uuid) {
      var device = Devices.findOne({uuid:uuid});
      if (device) {
        register_device(device);
      }
      return;
    }
    var allDevices = Devices.find({groupId: group_id});
    allDevices.forEach(function(device) {
        register_device(device);
    });
  }
  else if(uuid) {
    console.log("tay remove device from aixd.raidcdn~");
    HTTP.call('GET', 'http://aixd.raidcdn.cn/restapi/remove-device/'+uuid, function(error, res) {
      if (error)
        return console.log("remove device info to aixd.raidcdn failed " + error);
      var content = JSON.parse(res.content);
      console.log("removed this device （"+uuid+"）form aixd.raidcdn ："+content);
    })
  }
}

AI_system_register_company = function(group_id,userId){
  var ai_system_url = 'http://aixd.raidcdn.cn/restapi/reg-group';
  if(!group_id) {
    console.log('group_id not found');
    return;
  }
  if(!userId) {
    console.log('userId not found');
    return;
  }
  var group = Groups.findOne({_id: group_id});
  var user = Meteor.users.findOne({_id:userId});
  //console.log(user);
  if (group && user) {
    if (user.emails && user.emails.length > 0) {
      companyId = new Mongo.ObjectID()._str;
      emails = user.emails[0].address;
      HTTP.call('POST', ai_system_url, {
        data: {
            'companyId': companyId,
            'group_name': group.name,
            'creator_email': emails //TODO:
        }, timeout: 5*1000
      }, function(error, res) {
        var msgObj = {
          _id: new Mongo.ObjectID()._str,
          form: {
            id: '',
            name: '系统',
            icon: ''
          },
          to: {
            id: user._id,
            name: user.profile.fullname? user.profile.fullname:user.username,
            icon: user.profile.icon
          },
          images: [],
          to_type: "user",
          type: "register_company",
          text:'创建报告系统账户异常，请稍候重试~',
          create_time: new Date(),
          is_read: false
        };
        if (error){
          console.log("post company info to aixd.raidcdn failed " + error);
          sendMqttMessage('/msg/u/' + user._id,msgObj);
          return;
        }
        var content = JSON.parse(res.content);
        console.log('res.content.result'+content.result);
        if (content.result === 'success') {
          var perf_info = {
            companyId:companyId,
            companyName:group.name,
            reportUrl:'http://aixd.raidcdn.cn/reporter/'+companyId
          };
          Set_perf_link(group_id,perf_info);
          msgObj.text = '已自动为您创建 报告系统 账户：\r 账户：' + emails + '\r 默认密码：123456 \r报告系统地址 ： http://aixd.raidcdn.cn\r请及时登录系统修改默认密码';
        }
        else{
          console.log("registered this company to aixd.raidcdn" + content.error);
          console.log("registered this company to aixd.raidcdn" + content);
          //账户已存在
          if (content.error_code === 20003) {
            var company = content.info;
            if (company && company.companyName && company.companyId) {
              console.log('company info:'+content.info.companyName);
              msgObj.text = '检测到报告系统：' + company.companyName +'，是否进行绑定？';
              msgObj.isExist = true;
              msgObj.group_id = group_id;
              msgObj.perf_info =  {
                companyId:company.companyId,
                companyName:company.companyName,
                reportUrl:'http://aixd.raidcdn.cn/reporter/'+company.companyId
              };
            }
          }
        }
        sendMqttMessage('/msg/u/' + user._id,msgObj);
        
      });
    }
    else{
      console.log("user  email info  not found!" );
    }
  }
}

Set_perf_link = function(group_id,perf_info){
  if (!group_id || !perf_info) {
    return
  }
  var companyId = perf_info.companyId;
  if(companyId) {
      console.log("companyId is: " + companyId)
      Groups.update({_id: group_id}, {$set: {perf_info: perf_info, companyId: companyId}});
      GroupUsers.update({group_id: group_id}, {$set: {perf_info: perf_info, companyId: companyId}}, {multi: true});
      //AI_system_register_devices(group_id,null);
  }
}

sendGroupDelOrQuitMsg = function(group_id,group_name,form,to,to_type) {
  try{
    var msgObj = {
      _id: new Mongo.ObjectID()._str,
      form: form,
      to: to,
      to_type: to_type,
      type: 'text',
      text: '',
      create_time: new Date(),
      is_read: false,
      group_id: group_id
    };
    if (to_type == 'user') {
      msgObj.text = form.name + ' 解散了 [' + group_name + ']';
      msgObj.is_group_del = true;
      return sendMqttUserMessage && sendMqttUserMessage(to.id, msgObj);
    } else {
      msgObj.text = form.name + ' 退出了 [' + group_name + ']';
      return sendMqttGroupMessage && sendMqttGroupMessage(group_id, msgObj);
    }
  } catch (error){
    console.log('sendGroupDelOrQuitMsg Err:',error);
  }
};
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
          if(user && user.profile && user.profile.userType && user.profile.userType == 'admin') {
              console.log('this is adminstrator, do not add to any groups')
          }
          else if (user && GroupUsers.find({group_id: id, user_id: ids[i]}).count() <= 0){
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
  'create-group1': function(id, name, ids, template,offsetTimeZone){
    var slef = this;
    id = id || new Mongo.ObjectID()._str;
    ids = ids || [];
    template = template || {};
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
    var user = Meteor.users.findOne({_id:slef.userId});
    Groups.insert({
      _id: id,
      name: name,
      icon: '',
      describe: '',
      create_time: new Date(),
      template:template,
      offsetTimeZone: offsetTimeZone,
      last_text: '',
      last_time: new Date(),
      barcode: rest_api_url + '/restapi/workai-group-qrcode?group_id=' + id,
      //建群的人
      creator:{
        id:user._id,
        name:user.profile && user.profile.fullname ? user.profile.fullname : user.username
      }
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
      //AI_system_register_company(id,user._id);
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
            GroupUsers.update({group_id: isExist._id}, {$set: {perf_info: group.perf_info, companyId: group.companyId}});
            continue;
          }
          // console.log(user);
          GroupUsers.insert({
            group_id: group._id,
            group_name: group.name,
            group_icon: group.icon,
            perf_info:group.perf_info,
            companyId:group.companyId,
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
  'creator-delete-group': function(id, userId){
    try{
      // step 1. remove group
      Groups.remove({_id: id});
      // step 2. send group delete message
      groupUsers = GroupUsers.find({group_id: id}).fetch();
      var user = Meteor.users.findOne({_id: userId})
      async.each(groupUsers, function(item, callback) {

          if(user._id != item.user_id) {
            sendGroupDelOrQuitMsg(id,item.group_name,{
              id:   user._id,
              name: user.profile.fullname ? user.profile.fullname : user.username,
              icon: user.profile.icon
            }, {
              id: item.user_id,
              name: item.user_name,
              icon: item.user_icon
            }, 'user');
          }
          callback && callback();
      }, function(err) {
          // if any of the file processing produced an error, err would equal that error
          if( err ) {
            console.log('send group delete message Err:',err);
          } else {
            // step 3.  remove group_users
            GroupUsers.remove({group_id: id});
            
            // toDo . delete web 系统的company信息
            // toDo .删除考勤记录

            //删除这个组所有人的关联关系，下次不再初始化考勤
            WorkAIUserRelations.remove({"group_id" : id});
          }
      });
      return id;
    } catch (error){
      console.log('creator-delete-group Err:',error)
      return false
    }
  },
  'remove-group-user':function(id,userId){
    var groupuser = GroupUsers.findOne({group_id: id,user_id: userId});
    if (groupuser) {
      // send group quit message
      sendGroupDelOrQuitMsg(id,groupuser.group_name,{
        id: groupuser.user_id,
        name: groupuser.user_name,
        icon: groupuser.user_icon
      }, {
        id: groupuser.group_id,
        name: groupuser.group_name,
        icon: groupuser.group_icon
      }, 'group');

      GroupUsers.remove({_id:groupuser._id},function(err,res){
        if (err) {
          return console.log ('GroupUsers remove failed');
        }
        if (GroupUsers.find({group_id: id}).count() === 0){
          Groups.remove({_id:id});
        }
      });

      //删除这个人在这个组的关联关系，下次不再初始化考勤
      WorkAIUserRelations.remove({"group_id" : id, "app_user_id": userId});
    }
    return id;
  },
  'set-perf-link':function(group_id,perf_info){
    Set_perf_link(group_id,perf_info);
    return 'succ';
  },
  'get-group-intro':function(id,type){
    console.log('get-group-intro has been called!');
    var group = Groups.findOne({_id: id});
    var intro = null;
    if (group) {
      if (type == 'FACE') {
        intro = '欢迎加入WORKAI 讯动训练营。我们将通过本训练营展现数据操作／模型训练流程。当用户以“ 模版名 ”模版建立训练营之后，通过实时数据采集->进行标注的方式，在嵌入式端搜集数据集、自动训练以及模型部署，实时发送深度学习模型的处理到您的训练营以及Work AI绩效系统，提供完整的数据分析结果。';
      }
      if (type == 'NLP') {
        intro = '欢迎加入NLP演示训练营。我们将通过本训练营展现数据操作／模型训练流程。当用户以“NLP文本分类”模版建立训练营之后，通过输入链接->进行标注的方式，在后端搜集数据集、自动训练以及模型部署并可以通过API的方式进行文本分类预测。';
      }
    }
    if (intro) {
      var msgObj = {
        _id: new Mongo.ObjectID()._str,
        form: {
          id: '',
          name: 'WorkAI',
          icon: 'http://data.tiegushi.com/2LxzWbzhqhKqjtbTg_1492747414703.jpg'
        },
        to: {
          id: group._id,
          name: group.name,
          icon: group.icon
        },
        images: [],
        to_type: "group",
        type: "text",
        text: intro,
        create_time: new Date(),
        is_read: false
      };
      return msgObj;
    }
    return intro;
  },
  'ai-system-register-devices':function(group_id,uuid){
    console.log("AI_system_register_devices group_id= " + group_id+'& uuid='+uuid)
    //AI_system_register_devices(group_id,uuid);
    return 'succ';
  },
  'ai-checkin-out':function(data){
    try{
      if (this.userId) {
        data.operator = this.userId;
      }
      return PERSON.aiCheckInOutHandle(data);
    } catch (err){
      return err;
    }
  },
  'modifyGroupUserAdmin': function(group_id, user_id, isAdmin){
    var groupUser = SimpleChat.GroupUsers.findOne({group_id:group_id, user_id: user_id})
    if(groupUser){
      SimpleChat.GroupUsers.update({_id: groupUser._id},{$set:{isGroupAdmin: isAdmin}})
      return true;
    } else {
      return false;
    }
  },
  'removeGroupUser': function(group_id, user_id){
    GroupUsers.remove({group_id: group_id, user_id: user_id});
    return true;
  },
  'updateGroupInOutTime': function(_id, group_intime,group_outtime){
    Groups.update({_id: _id},{
      $set:{
        group_intime: group_intime,
        group_outtime:group_outtime
      }
    },function(error){
      if (error) {
        console.log('updateGroupInOutTime:'+error);
        return;
      }
      WorkAIUserRelations.find({group_id:_id}).observe({
        added:function(document){
          if (document && document.ai_persons && document.ai_persons.length > 0) {
            PERSON.updateWorkStatus(document.ai_persons[0].id);
          }
        }
      });
    });
  },
  'updateGroupAccuracyType':function(id,groupAccuracyType){
    //console.log('updateGroupAccuracyType:'+JSON.stringify(this));
    if (!this.userId) {
      return;
    }
    var target = GroupUsers.findOne({group_id:id,user_id:this.userId});
    if (target) {
      GroupUsers.update({_id:target._id},{$set:{groupAccuracyType:groupAccuracyType}});
    }
  },
  'updateGroupUserallowUnknowMember': function(group_id,user_id){
    var groupUser = SimpleChat.GroupUsers.findOne({group_id: group_id, user_id: user_id});
    if (groupUser){
      if (groupUser.allowUnknowMember){
        GroupUsers.update({_id: groupUser._id},{$set:{allowUnknowMember: false}});
      } else {
        GroupUsers.update({_id: groupUser._id},{$set:{allowUnknowMember: true}});
      }
    }
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
