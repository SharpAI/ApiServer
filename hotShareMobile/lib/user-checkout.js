if (Meteor.isServer){
  sendUserCheckoutEvent = function(deviceId, userId){
    var user = Meteor.users.findOne({_id: userId});
    var device = Meteor.users.findOne({username: deviceId});

    if (!user || !device)
      return;

    sendMqttMessage('/msg/u/' + userId, {
      _id: new Mongo.ObjectID()._str,
      form: {
        id: device._id,
        name: device.profile && device.profile.fullname ? device.profile.fullname : device.username,
        icon: device.profile && device.profile.icon ? device.profile.icon : '/device_icon_192.png'
      },
      to: {
        id: user._id,
        name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png'
      },
      to_type: "user",
      type: "text",
      text: '您今天还会进入公司吗？',
      create_time: new Date(),
      is_read: false
    });
  };

  Meteor.methods({
    // 获取用户需要弹窗提示：您已经下班了吗？
    getUCS: function(){
      if (!this.userId)
        return false;
      return UserCheckoutEndLog.find({userId: this.userId}).count() > 0;
    },
    // 用户明确已经下班的处理
    upUCS: function(){
      if (!this.userId)
        return false;
      
      var doc = UserCheckoutEndLog.findOne({userId: this.userId});
      if (!doc)
        return false;

      UserCheckoutEndLog.remove({_id: doc._id});
      send_greeting_msg(doc.params.msg_data);
      PERSON.updateWorkStatus(doc.params.person._id)
      if (doc.params.person_info)
        PERSON.sendPersonInfoToWeb(doc.params.person_info)
      return true;
    }
  });
} else {
  if (Meteor.isCordova){
    Meteor.startup(function(){
      var eventResume = function(){
        // 恢复APP的时候提示您是否已经下班？
        Tracker.autorun(function(){
          if (Meteor.userId()){
            Meteor.call('getUCS', function(err, res){
              if (!err && res){
                PUB.confirm('您确定已经下班了吗？', function(){
                  Meteor.call('upUCS', function(err1, res1){
                    console.log('您确定已经下班了吗？', (!err1 || !res1) ? 'succ' : 'error');
                    if (err1 || !res1)
                      return PUB.alert('操作失败~');
                  });
                });
              }
            });
          }
        });
      };
      document.addEventListener("resume", eventResume, false);
    });
  }
}