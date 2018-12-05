if (Meteor.isClient){
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

    Template._user_checkout_confirm.open('系统于 '+time.toLocaleString()+' 检测到你离开了监控组，请确认是否已经下班了?', function(result){

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
