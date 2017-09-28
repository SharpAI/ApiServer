var timeouts = {};
var addWhatsUpTip = function(userId, deviceId, groupId){
  if (!timeouts['_' + userId])
    timeouts['_' + userId] = {userId: userId, deviceId: deviceId, groupId: groupId, time: new Date().getTime(), count: 0};
  else
    timeouts['_' + userId].time = new Date().getTime();
};
var removeWhatsUpTip = function(userId){
  eval('delete timeouts._' + userId);
};
var sendPushMsg = function(userId, deviceId){
  var user = Meteor.users.findOne({_id: userId});
  var device = Meteor.users.findOne({username: deviceId});

  if (device && user){
    sendMqttMessage('/msg/u/' + userId, {
      _id: new Mongo.ObjectID()._str,
      form:{
        id: device._id,
        name: device.profile.fullname || device.username,
        icon: device.profile.icon
      },
      to: {
        id: userId,
        name: user.profile.fullname || user.username,
        icon: user.profile.icon || '',
      },
      to_type: "user",
      type: "text",
      text: "您今天计划做什么？",
      is_read: false
    });
    console.log('今天计划做什么？', user.profile.fullname || user.username);
  }
}
CreateSatsUpTipTask = function(userId, groupId, deviceId){
  var group = SimpleChat.Groups.findOne({_id: groupId});
  if (group && group.whats_up_send)
    return addWhatsUpTip(userId, deviceId, groupId);
  removeWhatsUpTip(userId);
};

Meteor.startup(function(){
  var upsetWhatsUpTip = function(doc){
    if (!doc.whats_up && doc.in_time != 0){
      var group = SimpleChat.Groups.findOne({_id: doc.group_id});
      if (group && group.whats_up_send)
        return addWhatsUpTip(doc.app_user_id, doc.in_uuid, doc.group_id);
    }
    removeWhatsUpTip(doc.app_user_id);
  };
  // WorkStatus.after.insert(function (userId, doc) {
  //   upsetWhatsUpTip(doc);
  // });
  // WorkStatus.after.update(function (userId, doc, fieldNames, modifier, options) {
  //   if (modifier['$set'].status === 'in'){
  //     upsetWhatsUpTip(doc);
  //   }
  // });

  Meteor.setInterval(function(){
    for(var key in timeouts){
      if (timeouts[key].count >= 8)
        continue;
      
      var now = new Date().getTime();
      if (now - timeouts[key].time >= 1000*60*30){
        var group = SimpleChat.Groups.findOne({_id: timeouts[key].groupId});
        var workStatus = WorkStatus.findOne({app_user_id: timeouts[key].userId, group_id: timeouts[key].groupId}, {sort: {date: -1}});
        if (group && group.whats_up_send && workStatus && !workStatus.whats_up){
          timeouts[key].count += 1;
          timeouts[key].time = now;
          sendPushMsg(timeouts[key].userId, timeouts[key].deviceId);
        }
      }
    }
  }, 1000*60);

  // test
  // var workStatus = WorkStatus.findOne({app_user_id: 'L3mAjMWmxd9MfTFAF', group_id: 'd2bc4601dfc593888618e98f'}, {sort: {date: -1}});
  // WorkStatus.update({_id: workStatus._id}, {$set: {status: 'in'}});
});

Meteor.methods({
  'uGroupWhatsUp': function(id, value){
    return SimpleChat.Groups.update({_id: id}, {$set: {whats_up_send: value}})
  }
});