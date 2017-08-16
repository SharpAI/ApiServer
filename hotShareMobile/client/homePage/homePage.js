Template.homePage.onRendered(function () {
  var date = Date.now();
  var mod = 24 * 60 * 60 *1000;
  date = date - (date%mod);
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  });
  Meteor.subscribe('WorkStatus',date,{
     onReady:function(){
      Session.set('WorkStatusLoading',false);
    }
  });
});


Template.homePage.helpers({
  isLoading:function(){
    if (Session.get('WorkStatusLoading') === false) {
      return false;
    }
    return true;
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
      var date = Date.now();
      var mod = 24 * 60 * 60 *1000;
      date = date - (date%mod);
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
modifyMyStatusFun = function(group_id,in_out){
    if (!group_id || !in_out) {
      return;
    }
    var deviceCount = Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).count();
    console.log(in_out);
    console.log(group_id);
    console.log(deviceCount);
    if(deviceCount === 0){
      return PUB.toast('未找到该群组下，方向为"'+in_out+'"的设备');
    }
    if(deviceCount === 1){
      var device = Devices.findOne({groupId: group_id,in_out:in_out},{sort:{createAt:-1}})
      return PUB.page('/timelineAlbum/'+device.uuid);
    }
    if(deviceCount > 1){
      Session.set('modifyMyStatus_group_id',group_id);
      Session.set('modifyMyStatus_in_out',in_out);
      $('.homePage .content').addClass('content_box');
      $('.user .content').addClass('content_box');
      return $('#selectDevicesInOut').modal('show');
    }
};

Template.homePage.events({
  'click .deviceItem': function(e){
    $('#selectDevicesInOut').modal('hide');
    $('.homePage .content').removeClass('content_box');
    setTimeout(function(){
      PUB.page('/timelineAlbum/'+e.currentTarget.id);
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
    WorkStatus.update({_id:_id},{
      $set:{whats_up:whats_up}
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
    modifyMyStatusFun(group_id,in_out);
  },
  'click .in-out-pic': function(e){
    e.stopImmediatePropagation();
    var src = $(e.currentTarget).attr('src')
    var time = new Date($(e.currentTarget).data('time'));
    $('.timeLayer').html(time.shortTime());
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
  }
})