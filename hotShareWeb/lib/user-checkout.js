if (Meteor.isServer){
  var timeout = null;
  sendUserCheckoutEvent = function(deviceId, userId){
    timeout && Meteor.clearTimeout(timeout);
    timeout = null;

    timeout = Meteor.setTimeout(function(){
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
      timeout = null;
    }, 1000*5);
  };

  Meteor.publish('getUCS', function(){
    if (!this.userId)
      return this.ready();
    return UserCheckoutEndLog.find({userId: this.userId});
  });

  Meteor.methods({
    // 获取用户需要弹窗提示：您已经下班了吗？
    getUCS: function(){
      if (!this.userId)
        return false;
      return UserCheckoutEndLog.find({userId: this.userId}).count() > 0;
    },
    // 用户明确已经下班的处理
    upUCS: function(){
      console.log('=====', this.userId);
      if (!this.userId)
        return false;
      
      var doc = UserCheckoutEndLog.findOne({userId: this.userId});
      if (!doc)
        return false;

      UserCheckoutEndLog.remove({_id: doc._id});
      var data = {
        user_id:this.userId,
        checkout_time: doc.params.person_info.ts,
        face_id:doc.params.msg_data.images.id,
        wantModify:true,
        person_info:doc.params.person_info
      };
      PERSON.aiCheckInOutHandle(data);
      // send_greeting_msg(doc.params.msg_data);
      // PERSON.updateWorkStatus(doc.params.person._id)
      // if (doc.params.person_info)
      //   PERSON.sendPersonInfoToWeb(doc.params.person_info)
      return true;
    }
  });
}