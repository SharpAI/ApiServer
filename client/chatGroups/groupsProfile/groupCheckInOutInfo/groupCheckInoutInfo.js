
var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var today = new ReactiveVar(null);
var todayUTC = new ReactiveVar(null);


var groupDevicesLoading = new ReactiveVar(false);
var workStatusLoading = new ReactiveVar(false);

var showTimeLayerGroupUser = new ReactiveVar({});


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

Template.groupCheckInoutInfo.onRendered(function () {

  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  theCurrentDay.set(date); // UTC日期
  todayUTC.set(date);
  theDisplayDay.set(displayDate); // 当前显示日期
  today.set(displayDate); // 今天

  var group_id = Session.get('groupsId');
  Meteor.subscribe('group_workstatus', group_id, date, {
    onReady: function(){
      groupDevicesLoading.set(false);
      workStatusLoading.set(false);
    }
  });
});

Template.groupCheckInoutInfo.helpers({
  timeLayer: function(){
    var _obj = showTimeLayerGroupUser.get();
    var date = theCurrentDay.get();
    var status = WorkStatus.findOne({_id: _obj._id});
    
    var time = null;
    var result = {};
    if(_obj.in_out == 'in'){
      time = new Date(status.in_time);
      time = time.shortTime(_obj.time_offset);

      result.src = status.in_image;
      result.video_src = status.in_video;
    } else {
      time = new Date(status.out_time);
      time = time.shortTime(_obj.time_offset)
      
      result.src = status.out_image;
      result.video_src = status.out_video;
    }
    result.time = time;
    return result;
  },
  workStatusList: function(){
    var group_id = Session.get('groupsId');
    var date = theCurrentDay.get();
    console.log(date)
    return WorkStatus.find({group_id: group_id,date: date}).fetch();
  },
  isLoading:function(){
    return workStatusLoading.get();
  },
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
  show_back_today: function(group_id){
    return theDisplayDay.get() !== today.get();
  },
  devices: function(){
    var group_id = Session.get('groupsId');
    var in_out = Session.get('modifyMyStatus_in_out');
    return Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).fetch();
  },
  enable_push:function(app_notifaction_status){
    return app_notifaction_status === 'on';
  },
  //显示在监控组的状态（历史出现都离开监控组）
  isStatusIN: function(status){
    if (this.in_time > 0) {
      var date = new Date(this.in_time);
      var time_offset = 8
      var group = SimpleChat.Groups.findOne({_id: this.group_id});
      if (group && group.offsetTimeZone) {
        time_offset = group.offsetTimeZone;
      }
      var fomatDate = date.shortTime(time_offset);
      var isToday = fomatDate.indexOf('今天') > -1 ? true : false;
      if (!isToday) {
        return false;
      }
    }
    return status === 'in';
  },
  //当天在监控组的状态
  isCurrentStatusIN:function(status){
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
  InComTimeLen: function(group_id){
    var group_id = this.group_id;
    var diff = 0;
    var out_time = this.out_time;
    var today_end = this.out_time;
    var time_offset = 8
    var group = SimpleChat.Groups.findOne({_id: group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }

    function DateTimezone(d, time_offset) {
        if (time_offset == undefined){
            if (d.getTimezoneOffset() == 420){
                time_offset = -7
            }else {
                time_offset = 8
            }
        }
        // 取得 UTC time
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var local_now = new Date(utc + (3600000*time_offset))
        var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
        local_now.getHours(), local_now.getMinutes());
      
        return today_now;
    }

    //计算out_time
    if(this.in_time) {
      //var today_start_utc = new Date(Date.now()).setUTCHours(0,0,0,0);

      var date = new Date(this.in_time);
      var fomatDate = date.shortTime(time_offset);
      var isToday = fomatDate.indexOf('今天') > -1 ? true : false;
      //不是今天的时间没有out_time的或者是不是今天时间，最后一次拍到的是进门的状态的都计算到当天结束
      if((!out_time && !isToday) || (this.status === 'in' && !isToday)) {
        date = DateTimezone(date,time_offset);
        day_end = new Date(date).setHours(23,59,59);
        //day_end = new Date(this.in_time).setUTCHours(0,0,0,0) + (24 - time_offset)*60*60*1000 - 1;
        out_time = day_end;
        this.in_time = date.getTime();
      }
      //今天的时间（没有离开过监控组）
      else if(!out_time && isToday) {
        var now_time = Date.now();
        out_time = now_time;
      }
      //今天的时间（离开监控组又回到监控组）
      else if(out_time && this.status === 'in' && isToday) {
        var now_time = Date.now();
        out_time = now_time;
      }
    }

    if(this.in_time && out_time){
      diff = out_time - this.in_time;
    }

    if(diff > 24*60*60*1000)
      diff = 24*60*60*1000;
    else if(diff < 0)
      diff = 0;

    var min = diff / 1000 / 60 ;
    var hour = Math.floor(min/60)+' h '+Math.floor(min%60) + ' min';
    if(min < 60){
      hour = Math.floor(min%60) + ' min';
    }
    if(diff == 0){
      hour = '0 min';
    }
    return hour;
  },
  modifyStatusClass: function(app_user_id){
    if(Meteor.userId() !== app_user_id){
      return 'modifyTaStatus';
    }
    return 'modifyMyStatus';
  },
  whatsUpLists: function(){
    console.log(this);
    var lists = [];
    if(typeof(this.whats_up) == 'string'){ // 旧数据兼容
      lists.push({
        person_name: this.person_name,
        content: this.whats_up,
        ts: this.in_time // 当天上班时间
      });
    } else {
      lists = this.whats_up;
    }
    return lists;
  },
  getShortTime: function(ts,group_id){
    var time_offset = 8
    var group = SimpleChat.Groups.findOne({_id: group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    var time = new Date(ts);
    return time.shortTime(time_offset,true);
  },

  isHistoryNoOut: function(group_id){
    var outtime = 0;

    if(this.out_time){
      outtime = this.out_time;
    }
    var isHistory = false;
    if(theDisplayDay.get() && theDisplayDay.get() !== today.get()){
      isHistory = true;
    }
    var noOut = false;
    if(outtime == 0){
      noOut = true;
    }
    return isHistory && noOut;
  }
});

Template.groupCheckInoutInfo.events({
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
    },1000);
  },
  'click .editWhatsUp':function(e){
    var _id = e.currentTarget.id;
    var whats_up = $(e.currentTarget).data('whatsup');
    $('.homePage .content').addClass('content_box');
    $('.saveWhatsUp').attr('id',_id);
    Session.set('editWhatsUpData',this);
    $('#EditorWhatsUp').val('');
    $('#myModal').modal('show');
    setTimeout(function(){
      $('#EditorWhatsUp').focus();
    },1000);
  },
  'click .saveWhatsUp':function(e){
    var _id = e.currentTarget.id;
    var content = $('#EditorWhatsUp').val();
    if(!content || content.length < 1 || content.replace(/\s+/gim, '').length ==0){ // 内容为空或者全是空白字符， 不能提交
      $('#EditorWhatsUp').val('');
      return $('#EditorWhatsUp').focus();
    }
    var data = Session.get('editWhatsUpData');
    console.log(data);
    $('#'+_id).data('whatsup',whats_up);
    var group_id = $('#'+_id).data('groupid');
    var statusId = $('#'+_id).data('id');
    var group = SimpleChat.GroupUsers.findOne({group_id:group_id,user_id: Meteor.userId()});
    console.log("group info is:", JSON.stringify(group));
    var editorName = group.user_name;
    //whats_up = editorName + ":" + whats_up;

    var whats_up = data.whats_up || []
    if(whats_up && typeof(whats_up) === 'string'){
      whats_up = [{
        person_name: data.person_name,
        content: whats_up,
        ts: data.in_time // 当天上班时间
      }]
    }

    whats_up.push({
      person_name: editorName,
      content: content,
      ts: Date.now()
    });
     
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
        text: '更新了今日简述：\r\n'+content,
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
    var group_id = Session.get('groupsId');
    var in_out = $(e.currentTarget).data('inout');
    var currentDay = theDisplayDay.get(); //当前显示的日期
    currentDay = new Date(currentDay);
    currentDay.setHours(23);
    currentDay.setMinutes(59);
    Session.set('wantModifyTime',currentDay);
    modifyStatusFun(group_id,in_out);
  },
  'click .modifyTaStatus': function(e){
    var group_id = Session.get('groupsId');
    var in_out = $(e.currentTarget).data('inout');
    var taId = $(e.currentTarget).data('taid');
    var taName = $(e.currentTarget).data('taname');
    var currentDay = theDisplayDay.get(); //当前显示的日期
    currentDay = new Date(currentDay);
    currentDay.setHours(23);
    currentDay.setMinutes(59);
    Session.set('wantModifyTime',currentDay);
    Session.set('modifyMyStatus_ta_name',taName);

    modifyStatusFun(group_id, in_out, taId);
    // navigator.notification.confirm('要帮「'+taName+'」出现吗？',function(index){
    //   if(index === 2){
    //     modifyStatusFun(group_id, in_out, taId);
    //   }
    // },'提示',['取消','帮TA出现']);
  },
  'click .in-out-pic': function(e){
    e.stopImmediatePropagation();
    var src = $(e.currentTarget).attr('src')
    var time = new Date($(e.currentTarget).data('time'));
    var group_id = $(e.currentTarget).data('groupid')
    var time_offset = 8
    // if (group_id == '73c125cc48a83a95882fced3'){
    //   //SWLAB 
    //   time_offset = -7
    // }else if (group_id == 'd2bc4601dfc593888618e98f'){
    //   //Kuming LAB
    //   time_offset = 8
    // }
    
    var group = SimpleChat.Groups.findOne({_id: group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }

    // $('.timeLayer').html(time.shortTime(time_offset));
    // $('.imgLayer img.img_item').attr('src',src);
    // var video_src = this.in_video || this.out_video;
    var in_out = $(e.currentTarget).data('inout');
    var video_src = null;
    if(in_out == 'in'){
      video_src = this.in_video;
    }
    if(in_out == 'out'){
      video_src = this.out_video;
    }

    showTimeLayerGroupUser.set({
      _id: this._id,
      in_out: in_out,
      time_offset: time_offset
    });
    // if (video_src) {
    //   $('.img_container .video-play-tip').show();
    //   $('.img_container').addClass('videos');
    //   $('.img_container').data('videosrc',video_src);
    // }
    $('.homePage').addClass('blur-element');
    $('#footer').addClass('blur-element');
    $('.inOutPicPreview').fadeIn('fast');
  },
  'click .inOutPicPreview': function(e){
    $('.img_container .video-play-tip').hide();
    $('.img_container').data('videosrc','');
    $('.img_container').removeClass('videos');
    $('.blur-element').removeClass('blur-element');
    $('.inOutPicPreview').fadeOut('fast');
  },
  'click .videos':function(e){
    e.stopImmediatePropagation();
    var video_src = $(e.currentTarget).data('videosrc');
    openVideoInBrowser(video_src);
  },
  'click .check_in_out':function(e){
    Router.go('/timeline');
  },
  'click .day_before':function(e){
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() - 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);
    
    var displayDay = theDisplayDay.get() - 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    
    workStatusLoading.set(true);
    Meteor.subscribe('group_workstatus', Session.get('groupsId'), theCurrentDay.get(), {
      onReady: function(){
        workStatusLoading.set(false);
      }
    });
  },
  'click .day_after':function(e){
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() + 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);

    var displayDay = theDisplayDay.get() + 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    
    workStatusLoading.set(true);
    Meteor.subscribe('group_workstatus', Session.get('groupsId'), theCurrentDay.get(), {
      onReady: function(){
        workStatusLoading.set(false);
      }
    });
  },
  'click .day_today': function(e){
    e.stopImmediatePropagation();
    var group_id = Session.get('groupsId');

    theCurrentDay.set(todayUTC.get());
    theDisplayDay.set(today.get());

    workStatusLoading.set(true);
    Meteor.subscribe('group_workstatus', Session.get('groupsId'), todayUTC.get(), {
      onReady: function(){
        workStatusLoading.set(false);
      }
    });
  }
});