Template.homePage.onRendered(function () {
  var date = new Date();
  date = date.parseDate('YYYY-MM-DD');
  date = Number(date.replace(/-/gi,""));
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  })
  Meteor.subscribe('WorkStatus',date);
});


Template.homePage.helpers({
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
      var date = new Date();
      date = date.parseDate('YYYY-MM-DD');
      date = Number(date.replace(/-/gi,""));
      return WorkStatus.find({
        group_id: group_id,
        date: date
      }).fetch();
    }
    return [];
  },
  hasTwoMoreGroup:function(){
    var workstatus = WorkStatus.find({app_user_id:Meteor.userId()});
    if (workstatus && workstatus.count() > 1) {
      return true;
    }
    return false;
  },
  myGroupWorkStatus:function(){
    return WorkStatus.find({app_user_id:Meteor.userId()}).fetch();
  },
  hasIntime:function(in_time){
    if (in_time && in_time !== 0) {
      return true;
    }
    var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
    if (workstatus && workstatus.in_time && workstatus.in_time !== 0) {
      return true;
    }
    return false;
  },
  inTime:function(in_time){
    var intime = in_time;
    if (!in_time) {
      var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
      if (workstatus && workstatus.in_time) {
        intime = workstatus.in_time;
      }
    }
    if (intime && intime !== 0) {
      var inDate = new Date(intime);
      if (inDate.toString() !== 'Invalid Date' ) {
        return inDate.shortTime();
      }
      return intime;
    }
    return '';
  },
  hasOutTime:function(out_time){
    if (out_time && out_time !== 0) {
      return true;
    }
    var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
    if (workstatus && workstatus.out_time && workstatus.out_time !== 0) {
      return true;
    }
    return false;

  },
  outTime:function(out_time){
    var outtime = out_time;
    if (!out_time) {
      var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
      if (workstatus && workstatus.out_time) {
        outtime = workstatus.out_time;
      }
    }
    if (outtime && outtime !== 0) {
      var outDate = new Date(outtime);
      if (outDate.toString() !== 'Invalid Date' ) {
        return outDate.shortTime();
      }
      return outtime;
    }
    return '';

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
  }
});
var modifyMyStatusFun = function(group_id,in_out){
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
      return $('#selectDevicesInOut').modal('show');
    }
};

Template.homePage.events({
  'click .deviceItem': function(e){
    $('#selectDevicesInOut').modal('hide');
    setTimeout(function(){
      PUB.page('/timelineAlbum/'+e.currentTarget.id);
    },1000);
  },
  'click .editWhatsUp':function(e){
    var _id = e.currentTarget.id;
    var whats_up = $(e.currentTarget).data('whatsup');
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
  },
  'click .modifyMyStatus':function(e){
    var group_id = e.currentTarget.id;
    var in_out = $(e.currentTarget).data('inout');
    modifyMyStatusFun(group_id,in_out);
  },
  'click .checkInTime, click .reReckInTime':function(e){
    var group_id = $(e.currentTarget).data('groupid');
    Session.set('wantModify',true);
    if (group_id) {
      modifyMyStatusFun(group_id,'in');
      return;
    }
    var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
    if (workstatus && workstatus.group_id) {
      modifyMyStatusFun(workstatus.group_id,'in');
    }
    else{
      PUB.page('/timeline');
    }
  },
  'click .checkOutTime,click .reReckOutTime':function(e){
    var group_id = $(e.currentTarget).data('groupid');
    Session.set('wantModify',true);
    if (group_id) {
      modifyMyStatusFun(group_id,'out');
      return;
    }
    var workstatus = WorkStatus.findOne({app_user_id:Meteor.userId()});
    if (workstatus && workstatus.group_id) {
      modifyMyStatusFun(workstatus.group_id,'out');
    }
    else{
      PUB.page('/timeline');
    }
  }
})