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
        text: '您今天还会进入监控组吗？',
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
      if (!this.userId)
        return false;
      
      var doc = UserCheckoutEndLog.findOne({userId: this.userId});
      if (!doc)
        return false;

      UserCheckoutEndLog.remove({_id: doc._id});
      var data = {
        user_id:this.userId,
        checkout_time: doc.params.person_info.ts,
        checkout_image:doc.params.person_info.img_url,
        face_id:doc.params.msg_data.images.id,
        wantModify:true,
        person_info:doc.params.person_info,
        operator:this.userId
      };
      PERSON.aiCheckInOutHandle(data);
      // send_greeting_msg(doc.params.msg_data);
      // PERSON.updateWorkStatus(doc.params.person._id)
      // if (doc.params.person_info)
      //   PERSON.sendPersonInfoToWeb(doc.params.person_info)
      return true;
    },
    // 选择没有下班
    upUCSN: function(){
      if (!this.userId)
        return false;
      
      var doc = UserCheckoutEndLog.findOne({userId: this.userId});
      if (!doc)
        return false;

      var startUTC = Date.UTC(doc.params.msg_data.create_time.getUTCFullYear(), doc.params.msg_data.create_time.getUTCMonth(), doc.params.msg_data.create_time.getUTCDate(), 0, 0, 0, 0)
      var endUTC = Date.UTC(doc.params.msg_data.create_time.getUTCFullYear(), doc.params.msg_data.create_time.getUTCMonth(), doc.params.msg_data.create_time.getUTCDate(), 23, 59, 59, 0)
      var workStatus = WorkStatus.findOne({group_id: doc.params.msg_data.group_id, app_user_id: this.userId, date: {$gte: startUTC, $lte: endUTC}});
      var workUserRet = WorkAIUserRelations.findOne({group_id: doc.params.msg_data.group_id, app_user_id: this.userId});

      if (workStatus && workStatus.out_time){
        WorkStatus.update({_id: workStatus._id}, {$set: {status: 'in', out_status: 'unknown', out_time: 0}});
        console.log('update WorkStatus');
      }
      if (workUserRet && workUserRet.checkout_time && workUserRet.checkout_time != 0){
        WorkAIUserRelations.update({_id: workUserRet._id}, {$set: {checkout_time: null, ai_out_time: null, ai_out_image: null, checkout_image: null, checkout_video: null}});
        console.log('update WorkAIUserRelations');
      }

      // TODO通知WEB
      /*if (doc.params && doc.params.person_info){
        var ai_system_url = process.env.AI_SYSTEM_URL || 'http://aixd.raidcdn.cn/restapi/rmout';
        //var ai_system_url = process.env.AI_SYSTEM_URL || 'http://192.168.0.121:3030/restapi/rmout';
        doc.params.person_info.fromWorkai = true;
        HTTP.call('POST', ai_system_url, {
          data: doc.params.person_info, timeout: 5*1000
        }, function(error, res) {
          if (error) {
            return console.log("post person info to aixd.raidcdn failed " + error);
          }
        });
      }*/
      return true;
    }
  });
}