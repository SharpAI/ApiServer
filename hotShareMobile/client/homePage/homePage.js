Template.homePage.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  Session.set('theCurrentDay',date); //UTC日期
  Session.set('theDisplayDay',displayDate); //当前显示的日期
  Session.set('today',displayDate); //今天
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  });
  Meteor.subscribe('WorkStatus',date,{
     onReady:function(){
      Session.set('WorkStatusLoading',false);
    }
  });
});

var parseDate = function(currentDay){
  var today = new Date(Session.get('today'));
  var month = currentDay.getMonth() + 1;
  var date = month + '月' +currentDay.getDate() +'日';
  if (currentDay.getDate() === today.getDate()) {
    date = date + ' 今天';
  }
  else if (currentDay.getDate() - today.getDate() === -1 ) {
    date = date + ' 昨天';
  }
  else {
    var day = '';
    switch(currentDay.getDay())
    {
    case 0:
      day = '星期日';
      break;
    case 1:
      day = '星期一';
      break;
    case 2:
      day = '星期二';
      break;
    case 3:
      day = '星期三';
      break;
    case 4:
      day = '星期四';
      break;
    case 5:
      day = '星期五';
      break;
    case 6:
      day = '星期六';
      break;
    default:
      break;
    }
    date = date + ' ' +day;
  }
  return date;
};

Template.homePage.helpers({
  isLoading:function(){
    if (Session.get('WorkStatusLoading') === false) {
      return false;
    }
    return true;
  },
  has_day_before:function(){
    var currentDay = Session.get('theDisplayDay'); //当前显示的日期
    var today = Session.get('today'); //今天
    var lastday =  today - 7 * 24 * 60 * 60 *1000; //7天前
    return currentDay > lastday;
  },
  day_title:function(){
    var currentDay = Session.get('theDisplayDay'); //当前显示的日期
    currentDay = new Date(currentDay);
    return parseDate(currentDay);
  },
  has_day_after:function(){
    var currentDay = Session.get('theDisplayDay'); //当前显示的日期
    var today = Session.get('today'); //今天
    return currentDay < today;
  },
  lists: function(){
    var lists = [];
    SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach(function(item){
      var devices =  Devices.find({groupId: item.group_id},{sort:{createAt:-1}}).fetch();
      if(devices.length > 0){
        lists.push({
          group_id: item.group_id,
          group_name: item.group_name,
          devices:devices
        });
      }
    });
    return lists;
  },
  devices: function(){
    var group_id = Session.get('modifyMyStatus_group_id');
    var in_out = Session.get('modifyMyStatus_in_out');
    return Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).fetch();
  },
  workstatus: function(group_id){
    if(group_id){
      var date = Session.get('theCurrentDay');
      return WorkStatus.find({
        group_id: group_id,
        date: date
      }).fetch();
    }
    return [];
  },
  isStatusIN: function(status){
    return status === 'in';
  },
  isInStatusNormal: function(in_status){
    return in_status === 'normal';
  },
  isInStatusWarning: function(in_status){
    return in_status === 'warning';
  },
  isInStatusError: function(in_status){
    return in_status === 'error';
  },
  isInStatusUnknown: function(in_status){
    return in_status === 'unknown';
  },

  isOutStatusNormal: function(out_status){
    return out_status === 'normal';
  },
  isOutStatusWarning: function(out_status){
    return out_status === 'warning';
  },
  isOutStatusError: function(out_status){
    return out_status === 'error';
  },
  isOutStatusUnknown: function(out_status){
    return out_status === 'unknown';
  },
  isMySelf: function(app_user_id){
    return Meteor.userId() === app_user_id;
  },
  InComTimeLen: function(){
    var diff = 0;
    var out_time = this.out_time || Date.now();
    if(this.in_time){
      diff = out_time - this.in_time;
    }
    var min = diff / 1000 / 60 ;
    var hour = Math.floor(min/60)+' h '+Math.floor(min%60) + ' min';
    if(min < 60){
      hour = Math.floor(min%60) + ' min';
    }
    if(diff == 0){
      hour = '0 min';
    }
    return hour;
  }
});
modifyStatusFun = function(group_id,in_out,taId){
    if (!group_id || !in_out) {
      return;
    }
    Session.set('modifyMyStatus_ta_id',null);
    var deviceCount = Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).count();
    console.log(in_out);
    console.log(group_id);
    console.log(deviceCount);
    if(deviceCount === 0){
      return PUB.toast('未找到该群组下，方向为"'+in_out+'"的设备');
    }
    if(deviceCount === 1){
      var device = Devices.findOne({groupId: group_id,in_out:in_out},{sort:{createAt:-1}})
      if(taId){
        Session.set('wantModify',true);
        return PUB.page('/timelineAlbum/'+device.uuid+'?taId='+taId);
      }
      return PUB.page('/timelineAlbum/'+device.uuid);
    }
    if(deviceCount > 1){
      Session.set('modifyMyStatus_group_id',group_id);
      Session.set('modifyMyStatus_in_out',in_out);
      Session.set('modifyMyStatus_ta_id',taId);
      $('.homePage .content').addClass('content_box');
      $('.user .content').addClass('content_box');
      return $('#selectDevicesInOut').modal('show');
    }
};

Template.homePage.events({
  'click .deviceItem': function(e){
    $('#selectDevicesInOut').modal('hide');
    $('.homePage .content').removeClass('content_box');
    var taId = Session.get('modifyMyStatus_ta_id');
    var pageUrl = '/timelineAlbum/'+e.currentTarget.id;
    if(taId){
      Session.set('wantModify',true);
      pageUrl = '/timelineAlbum/'+e.currentTarget.id+'?taId='+taId;
    }
    setTimeout(function(){
      PUB.page(pageUrl);
    },1000);
  },
  'click .editWhatsUp':function(e){
    var _id = e.currentTarget.id;
    var whats_up = $(e.currentTarget).data('whatsup');
    $('.homePage .content').addClass('content_box');
    $('.saveWhatsUp').attr('id',_id);
    $('#EditorWhatsUp').val(whats_up);
    $('#myModal').modal('show');
    setTimeout(function(){
      $('#EditorWhatsUp').focus();
    },1000);
  },
  'click .saveWhatsUp':function(e){
    var _id = e.currentTarget.id;
    var whats_up = $('#EditorWhatsUp').val();
    $('#'+_id).data('whatsup',whats_up);
    var group_id = $('#'+_id).data('groupid');
    var group = SimpleChat.GroupUsers.findOne({group_id:group_id,user_id: Meteor.userId()});
    WorkStatus.update({_id:_id},{
      $set:{whats_up:whats_up}
    },function(err,num){
      if(err){
        return PUB.toast('请重试');
      }
      if(!group){
        return;
      }
      var msgObj = {
        _id: new Mongo.ObjectID()._str,
        form:{
          id: group.user_id,
          name: group.user_name,
          icon: group.user_icon
        },
        to: {
          id:   group.group_id,
          name: group.group_name,
          icon: group.group_icon 
        },
        to_type: 'group',
        type: 'text',
        text: '我更新了今日简述：\r\n'+whats_up,
        create_time: new Date(),
        is_read: false,
        // send_status: 'sending'
      };
      console.log(msgObj)
      sendMqttGroupMessage(group_id,msgObj);
    });
    $('#myModal').modal('hide');
    $('.homePage .content').removeClass('content_box');
  },
  'click .close ,click .cancelWhatsUp':function(e){
    $('.homePage .content').removeClass('content_box');
  },
  'click .modifyMyStatus':function(e){
    var group_id = e.currentTarget.id;
    var in_out = $(e.currentTarget).data('inout');
    modifyStatusFun(group_id,in_out);
  },
  'click .modifyTaStatus': function(e){
    var group_id = e.currentTarget.id;
    var in_out = $(e.currentTarget).data('inout');
    var taId = $(e.currentTarget).data('taid');
    var taName = $(e.currentTarget).data('taname');

    navigator.notification.confirm('要帮「'+taName+'」签到吗？',function(index){
      if(index === 2){
        modifyStatusFun(group_id, in_out, taId);
      }
    },'提示',['取消','帮TA签到']);
  },
  'click .in-out-pic': function(e){
    e.stopImmediatePropagation();
    var src = $(e.currentTarget).attr('src')
    var time = new Date($(e.currentTarget).data('time'));
    var group_id = $(e.currentTarget).data('groupid')
    var time_offset = 0
    if (group_id == '73c125cc48a83a95882fced3'){
      //SWLAB 
      time_offset = -7
    }else if (group_id == 'd2bc4601dfc593888618e98f'){
      //Kuming LAB
      time_offset = 8
    }
    
    $('.timeLayer').html(time.shortTime(time_offset));
    $('.imgLayer img').attr('src',src);
    $('.homePage').addClass('blur-element');
    $('#footer').addClass('blur-element');
    $('.inOutPicPreview').fadeIn('fast');
  },
  'click .inOutPicPreview': function(e){
    $('.blur-element').removeClass('blur-element');
    $('.inOutPicPreview').fadeOut('fast');
  },
  'click .check_in_out':function(e){
    Router.go('/timeline');
  },
  'click .panel-heading':function(e){
    var group_id = e.currentTarget.id;
    var group = SimpleChat.GroupUsers.findOne({group_id:group_id,user_id:Meteor.userId()});
    if (group.companyId) {
      Session.set('reportUrl', group.perf_info.reportUrl);
      Router.go('perfShow');
    }
    else{
      PUB.toast('尚未绑定公司~快去扫描绩效二维码进行绑定吧！');
    }
  },
  'click .day_before':function(){
    var currentDay = Session.get('theCurrentDay');
    currentDay = currentDay - 24 * 60 * 60 * 1000;
    Session.set('theCurrentDay', currentDay);
    
    var theDisplayDay = Session.get('theDisplayDay');
    theDisplayDay = theDisplayDay - 24 * 60 * 60 * 1000;
    Session.set('theDisplayDay', theDisplayDay);
    
    
    Session.set('WorkStatusLoading',true);
    Meteor.subscribe('WorkStatus',currentDay,{
      onReady:function(){
        Session.set('WorkStatusLoading',false);
      }
    });
  },
  'click .day_after':function(){
    var currentDay = Session.get('theCurrentDay');
    currentDay = currentDay + 24 * 60 * 60 * 1000;
    Session.set('theCurrentDay', currentDay);
    
    var theDisplayDay = Session.get('theDisplayDay');
    theDisplayDay = theDisplayDay + 24 * 60 * 60 * 1000;
    Session.set('theDisplayDay', theDisplayDay);
    
    Session.set('WorkStatusLoading',true);
    Meteor.subscribe('WorkStatus',currentDay,{
      onReady:function(){
        Session.set('WorkStatusLoading',false);
      }
    });
  }
});
