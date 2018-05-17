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
      send_greeting_msg(doc.params.msg_data);
      PERSON.updateWorkStatus(doc.params.person._id)
      if (doc.params.person_info)
        PERSON.sendPersonInfoToWeb(doc.params.person_info)
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
} else if (Meteor.isClient){
  var showConfirm = function(time,tryAgain){
    var latest_confirm = localStorage.getItem('latest_user_checkout_confirm') || 0;
    var latest_checkout_time = localStorage.getItem('latest_user_checkout_log_time');
    var now = Date.now();
    
    // 如果time相同， 点击过后， 不再弹出第二次
    if(!tryAgain && latest_checkout_time === time){
      return;
    }
    // 10 分钟内,提示信息不重复弹出
    if (!tryAgain && (now - latest_confirm) < (10*60*1000)){
      return;
    }

    Template._user_checkout_confirm.open('系统于 '+time.toLocaleString()+' 检测到你离开了公司，请确认是否已经下班了?', function(result){

      localStorage.setItem('latest_user_checkout_confirm',Date.now());
      localStorage.setItem('latest_user_checkout_log_time', time);
      
      if (result){
        Meteor.call('upUCS', function(err1, res1){
          console.log('您确定已经下班了吗？', (!err1 || !res1) ? 'succ' : 'error');
          if (err1 || !res1){
            PUB.alert('操作失败，请重试~', function(){
              showConfirm(time, true);
            });
          }
        });
      } else {
        Meteor.call('upUCSN');
        console.log('===no===');
      }
    });
  };

  Meteor.startup(function(){
    Tracker.autorun(function(){
      if (Meteor.userId())
        Meteor.subscribe('getUCS');

      if (Meteor.userId() && UserCheckoutEndLog.find({userId: Meteor.userId()}).count() > 0){
        var checkout_log = UserCheckoutEndLog.findOne({userId: Meteor.userId()});
        var now = checkout_log && checkout_log.params && checkout_log.params.msg_data && checkout_log.params.msg_data.create_time ? checkout_log.params.msg_data.create_time : new Date(); 
        showConfirm(now);
      }
    });
  });
}