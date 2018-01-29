var view = null;

var isLoading = new ReactiveVar(false);
var group = new ReactiveVar({});
var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var today = new ReactiveVar(null);
var todayUTC = new ReactiveVar(null);

var whatsup = new ReactiveVar({});
workStatusPopPage = {
  show: function(template, showClose){
    workStatusPopPage.close();
    var data = Session.get('workstatus_group')
    view = Blaze.renderWithData(Template.workStatusPopPage, data, document.body);
  },
  close: function(){
    if(view){
      Blaze.remove(view);
      view = null;
    }
  },
  isShow: function(){
    return view != null;
  }
};

var modifyStatusFun = function(group_id,in_out,taId){
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
      workStatusPopPage.close();
      var device = Devices.findOne({groupId: group_id,in_out:in_out},{sort:{createAt:-1}})
      Session.set('wantModify',true);
      if(taId){
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

var parseDate = function(currentDay){
  //var today = new Date(Session.get('today'));
  var year = currentDay.getFullYear();
  var month = currentDay.getMonth() + 1;
  var date = year + '-' + month + '-' +currentDay.getDate();
  // if (currentDay.getDate() === today.getDate()) {
  //   date = date + ' 今天';
  // }
  // else if (currentDay.getDate() - today.getDate() === -1 ) {
  //   date = date + ' 昨天';
  // }
  //else {
    var day = '';
    switch(currentDay.getDay())
    {
    case 0:
      day = '周日';
      break;
    case 1:
      day = '周一';
      break;
    case 2:
      day = '周二';
      break;
    case 3:
      day = '周三';
      break;
    case 4:
      day = '周四';
      break;
    case 5:
      day = '周五';
      break;
    case 6:
      day = '周六';
      break;
    default:
      break;
    }
    date = date + ' ' +day;
  //}
  return date;
};

Template.workStatusPopPage.onRendered(function(){
  var data = this.data; // groups info
  group.set(data);

  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  theCurrentDay.set(date); // UTC日期
  todayUTC.set(date);
  theDisplayDay.set(displayDate); // 当前显示日期
  today.set(displayDate); // 今天
  isLoading.set(true);
  Meteor.subscribe('group_workstatus',data._id, date, function(){
    isLoading.set(false);
  });
});
Template.workStatusPopPage.helpers({
  has_day_before:function(group_id){
    var lastday =  today.get() - 7 * 24 * 60 * 60 *1000; //7天前
    return theDisplayDay.get() > lastday;
  },
  day_title:function(){
    var currentDay = new Date(theDisplayDay.get());
    return parseDate(currentDay);
  },
  has_day_after:function(group_id){
    // 可以查看后面两天天数据
    _today = new Date(today.get());
    _today.setDate(_today.getDate() + 2);
    _today = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate()).getTime();
    return theDisplayDay.get() < _today;
  },
  isLoading: function() {
    return isLoading.get();
  },
  hasWorkStatus: function () {
    return WorkStatus.find({group_id: group.get()._id,date: theCurrentDay.get()}).count() > 0;
  },
  lists: function(){
    return WorkStatus.find({group_id: group.get()._id,date: theCurrentDay.get()}).fetch();
  },
  devices: function(){
    var group_id = Session.get('modifyMyStatus_group_id') || group.get()._id;
    var in_out = Session.get('modifyMyStatus_in_out');
    return Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).fetch();
  },
  getIcon: function(){
    return this.out_image || this.in_image;
  },
  enable_push:function(){
    if (this.app_notifaction_status && this.app_notifaction_status === 'on') {
      return 'text-success';
    }
    return 'text-gray';
  },
  bind_app_user: function() {
    if (this.app_user_id) {
      return 'text-success';
    }
    return 'text-gray';
  },
  getInOutStatus: function(){
    if (this.in_time > 0) { // 不是今天一律算 out 
      var date = new Date(this.in_time);
      var time_offset = 8
      var _group = group.get();
      if (_group && _group.offsetTimeZone) {
        time_offset = _group.offsetTimeZone;
      }
      var fomatDate = date.shortTime(time_offset);
      var isToday = fomatDate.indexOf('今天') > -1 ? true : false;
      if (!isToday) {
        return 'bg-gray';
      }
    }
    if(this.status == 'in'){
      return 'bg-success';
    }
    return 'bg-gray';
  },
  getStatus: function(type){
    var status = '';
    if(type == 'in'){
      status = this.in_status;
    }
    if(type == 'out'){
      status = this.out_status;
    }
    switch (status) {
      case 'normal':
        return 'bg-success';
        break;
      case 'warning':
        return 'bg-warning';
        break;
      case 'error':
        return 'bg-error';
        break;
      case 'unknown':
        return 'bg-gray';
        break;
      default:
        return 'bg-gray';
        break;
    }
  },
  getTime: function(type){
    var time = null;
    if(type == 'in'){
      time = this.in_time;
    }
    if(type == 'out') {
      time = this.out_time;
      if(this.status == 'in'){
        time = null;
      }
    }
    var time_offset = 8;
    var _group = group.get();
    if (_group && _group.offsetTimeZone) {
      time_offset = _group.offsetTimeZone;
    }
    if(time){
      time = new Date(time);
      time = time.shortTime(time_offset)
    } else {
      time = '--:--';
    }
    return time;
  },
  getWhatsup: function(){
    if(this.whats_up && this.whats_up.length > 0){
      return this.whats_up[0];
    }
    return '今天还没有工作安排...';
  },
  whatsup: function(){
    return whatsup.get();
  },
  getShortTime: function(ts,group_id){
    var time_offset = 8
    var _group = group.get();
    if (_group && _group.offsetTimeZone) {
      time_offset = _group.offsetTimeZone;
    }
    var time = new Date(this.ts);
    return time.shortTime(time_offset,true);
  },
});


Template.workStatusPopPage.events({
  'click #closeStausPop': function(){
    return workStatusPopPage.close();
  },
  // edit What's up
  'click .editWhatsup': function(e){
    whatsup.set({
      _id: this._id,
      content: this.whats_up,
      name: this.person_name
    });

    $('#EditorWhatsUp').val('');
    $('#myModal').modal('show');
    setTimeout(function(){
      $('#EditorWhatsUp').focus();
    },1000);
  },
  // save whats up
  'click .saveWhatsUp':function(e){
    var _whatsup = whatsup.get();
    var content = $('#EditorWhatsUp').val();
    if(!content || content.length < 1 || content.replace(/\s+/gim, '').length ==0){ // 内容为空或者全是空白字符， 不能提交
      $('#EditorWhatsUp').val('');
      return $('#EditorWhatsUp').focus();
    }
    console.log(_whatsup)
    var whats_up = _whatsup.content || [];

    whats_up.push({
      person_name:  _whatsup.name,
      content: content,
      ts: Date.now()
    });
     
    WorkStatus.update({_id:_whatsup._id},{
      $set:{whats_up:whats_up}
    },function(err,num){
      if(err){
        return PUB.toast('请重试');
      }
      var _group = group.get();
      var user = Meteor.user();
      var msgObj = {
        _id: new Mongo.ObjectID()._str,
        form:{
          id: user._id,
          name: user.profile.fullname?user.profile.fullname:user.username,
          icon: user.profile.icon
        },
        to: {
          id:   _group._id,
          name: _group.name,
          icon: _group.icon 
        },
        to_type: 'group',
        type: 'text',
        text: '更新了今日简述：\r\n'+content,
        create_time: new Date(),
        is_read: false,
        // send_status: 'sending'
      };
      console.log(msgObj)
      sendMqttGroupMessage(_group._id,msgObj);
    });
    $('#myModal').modal('hide');
    $('.homePage .content').removeClass('content_box');
  },
  'click .cancelWhatsUp':function(e){
    $('.homePage .content').removeClass('content_box');
  },
  // 修改上班时间
  'click .editInTime': function(e) {
    var isMyself = false;
    if( this.app_user_id && this.app_user_id == Meteor.userId() ){
      isMyself = true;
    }
    
    var group_id = group.get()._id;

    var currentDay = theDisplayDay.get(); //当前显示的日期
    currentDay = new Date(currentDay);
    currentDay.setHours(23);
    currentDay.setMinutes(59);
    Session.set('wantModifyTime',currentDay);

    if(isMyself){
      modifyStatusFun(group_id,'in');
    } else {
      modifyStatusFun(group_id, 'in', this.app_user_id);
    }
  },
  // 修改下班时间
  'click .editOutTime': function(e) {
    var isMyself = false;
    if( this.app_user_id && this.app_user_id == Meteor.userId() ){
      isMyself = true;
    }
    
    var group_id = group.get()._id;
    
    var currentDay = theDisplayDay.get(); //当前显示的日期
    currentDay = new Date(currentDay);
    currentDay.setHours(23);
    currentDay.setMinutes(59);
    Session.set('wantModifyTime',currentDay);

    if(isMyself){
      modifyStatusFun(group_id,'out');
    } else {
      modifyStatusFun(group_id, 'out', this.app_user_id);
    }
  },
  // goNextDay
  'click .nextDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() + 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);

    var displayDay = theDisplayDay.get() + 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    
    isLoading.set(true);
    Meteor.subscribe('group_workstatus', group.get()._id, theCurrentDay.get(), function() {
      isLoading.set(false);
    });
  },
  // goPrevDay
  'click .prevDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() - 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);
    
    var displayDay = theDisplayDay.get() - 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    
    isLoading.set(true);
    Meteor.subscribe('group_workstatus',group.get()._id, theCurrentDay.get(), function() {
      isLoading.set(false);
    });
  },
  'click .deviceItem': function(e){
    $('#selectDevicesInOut').modal('hide');
    $('.homePage .content').removeClass('content_box');
    var taId = Session.get('modifyMyStatus_ta_id');
    var pageUrl = '/timelineAlbum/'+e.currentTarget.id;
    Session.set('wantModify',true);
    if(taId){
      pageUrl = '/timelineAlbum/'+e.currentTarget.id+'?taId='+taId;
    }
    setTimeout(function(){
      PUB.page(pageUrl);
      workStatusPopPage.close();
    },1000);
  },
});