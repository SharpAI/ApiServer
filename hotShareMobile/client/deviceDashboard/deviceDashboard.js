var date = new ReactiveVar(null);
var today         = new ReactiveVar(null);
var time_offset = new ReactiveVar(8);

var lists         = new ReactiveVar([]);
var isOut        = new ReactiveVar(false);
var limit = new ReactiveVar(200);
var ckeckInNames = new ReactiveVar([]);
var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var popObj = new ReactiveVar({});
var isLoading = new ReactiveVar(false);
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
Template.deviceDashboard.onRendered(function () {
  isOut.set(false);
  isLoading.set(true);
  var now = new Date();
  var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  var group_id = Router.current().params.group_id;

  date.set(_date); //UTC日期
  today.set(_today);
  theDisplayDay.set(_today); // 当前显示日期
  theCurrentDay.set(_date); // UTC日期

  Meteor.subscribe('device_by_groupId', group_id);
  
  Meteor.subscribe('get-group', group_id,{
    onReady: function(){
      var _group = SimpleChat.Groups.findOne({_id: group_id});
      if(_group && _group.offsetTimeZone){
        time_offset.set(_group.offsetTimeZone);
      }
    }
  });
  Meteor.subscribe('WorkStatusByGroup',date.get(), group_id,{
     onReady:function(){
      isLoading.set(false);
      var checkin_names = ckeckInNames.get();
      WorkStatus.find({group_id: group_id, date: date.get()}).forEach(function(item) {
        if(!item.in_time && !item.out_time) {
          checkin_names.push(item.person_name);
        }
      });

      ckeckInNames.set(checkin_names);
    }
  });

  Meteor.subscribe('group_person',group_id, limit.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  
});

Template.deviceDashboard.helpers({
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
    var _today = new Date(today.get());
    _today.setDate(_today.getDate() + 2);
    _today = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate()).getTime();
    return theDisplayDay.get() < _today;
  },
  isLoading: function() {
    return isLoading.get();
  },
  checkInLists: function() {
    // var now = new Date();
    // var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
    //     0, 0, 0, 0);

    var group_id = Router.current().params.group_id;

    // date.set(_date); //UTC日期
    // today.set(_today);

    var lists = [];
    WorkStatus.find({group_id: group_id, date: theCurrentDay.get()}).forEach( function (item) {
      if (item.in_time || item.out_time) {
        lists.push(item);
      }
    });
    return lists;
  },
  unCkeckLists: function() {
    // var now = new Date();
    // var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
    //     0, 0, 0, 0);

    var group_id = Router.current().params.group_id;

    var lists = [];
    WorkStatus.find({group_id: group_id, date: theCurrentDay.get()}).forEach( function (item) {
      if (item.in_time || item.out_time) {
        lists.push(item.person_name);
      }
    });

    return Person.find({group_id: group_id, name: {$nin: lists}},{limit: limit.get(), sort:{createAt: -1}}).fetch();
  },
  groupName: function(){
    return Session.get('deviceDashboardTitle');
  },
  isOut: function(){
    return isOut.get();
  },
  getCheckInImage: function() {
    if(this.in_time && this.in_image) {
      return this.in_image;
    }
    if(this.out_time && this.out_image) {
      return this.out_image;
    }
  },
  getTime: function(){
    var ts = null;
    if(this.in_time) {
      ts = this.in_time;
    }
    /*if(this.out_time) {
      ts = this.out_time;
    }*/

    if(!ts || ts == null || ts == 0){
      return '-/-';
    }
    
    var time = new Date(ts);
    return time.shortTime(time_offset.get());
  }
});

Template.deviceDashboard.events({
  'click .leftButton': function(){
    return PUB.back();
  },
  'click .rightButton': function(){
    if(isOut.get()){
      isOut.set(false);
    } else {
      isOut.set(true);
    }
  },
  'click .popItem': function(e) {
    popObj.set(this);
    $('.deviceDashPoppage').fadeIn();
  },
  // goNextDay
  'click .nextDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() + 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);

    var displayDay = theDisplayDay.get() + 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    var group_id = Router.current().params.group_id;
    isLoading.set(true);
    Meteor.subscribe('WorkStatusByGroup',theCurrentDay.get(), group_id,{
      onReady:function(){
       isLoading.set(false);
     }
    });
  },
  // goPrevDay
  'click .prevDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() - 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);
    
    var displayDay = theDisplayDay.get() - 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    var group_id = Router.current().params.group_id;
    isLoading.set(true);
    Meteor.subscribe('WorkStatusByGroup',theCurrentDay.get(), group_id,{
      onReady:function(){
       isLoading.set(false);
     }
    });
  },
});

Template.deviceDashPoppage.helpers({
  data: function() {
    var obj = popObj.get();
    var url = obj.in_image?obj.in_image:obj.out_image;
    
    var diff = 0;
    var out_time = obj.out_time;
    if (!obj.out_time) {
      var now_time = Date.now();
      out_time = now_time;
    }
    
    if (obj.in_time && out_time){
      diff = out_time - obj.in_time;
    }

    if(diff > 24*60*60*1000){
      diff = 24*60*60*1000;
    } else if(diff < 0) {
      diff = 0;
    }
    
    var min = diff / 1000 / 60 ;
    var in_company_tlen = Math.floor(min/60)+' h '+Math.floor(min%60) + ' min';
    if(min < 60){
      in_company_tlen = Math.floor(min%60) + ' min';
    }
    if(diff == 0){
      in_company_tlen = '0 min';
    }

    return {
      _id: obj._id,
      url: url,
      name: obj.person_name,
      in_company_tlen: in_company_tlen,
      in_time: obj.in_time? (new Date(obj.in_time)).shortTime(time_offset.get()): null,
      out_time: obj.out_time? (new Date(obj.out_time)).shortTime(time_offset.get()): null
    }
  }
});

Template.deviceDashPoppage.events({
  'click .deviceDashPoppage, click #closeDDPop': function (e) {
    return $('.deviceDashPoppage').fadeOut();
  },
  'click .resetWorkStatus': function (e) {
    e.stopImmediatePropagation();
    PUB.confirm('是否要移除该成员当前签到信息？请确认！', function() {
      var obj = popObj.get();
      var personId = obj.person_id[0].id; 

      Meteor.call('resetMemberWorkStatus',e.currentTarget.id, personId, function(error, result) {
        if (error) {
          return PUB.toast('请重试~');
        }
        $('.deviceDashPoppage').fadeOut();
        return PUB.toast('已移除');
      });
    });
  },
  'click .changeWorkStatus': function (e) {
    e.stopImmediatePropagation();
    var obj = popObj.get();
    var group_id = obj.group_id;
    var personId = obj.person_id[0].id; 
    
    var deviceLists = Devices.find({groupId: group_id}).fetch();

    Session.set('modifyMyStatus_person_name', obj.person_name);

    if (!deviceLists || deviceLists.length < 1) {
      return PUB.toast('未找到相应设备');
    }

    if (deviceLists && deviceLists.length == 1 && deviceLists[0].uuid) {
      return PUB.page('/timelineAlbum/'+deviceLists[0].uuid+'?pid='+personId);
    } else {
      var buttonLabels = [];
      deviceLists.forEach(function(item) {
        buttonLabels.push(item.name);
      });
      var options = {
        title: '选择设备以修改签到时间',
        buttonLabels: buttonLabels,
        addCancelButtonWithLabel: '取消',
        androidEnableCancelButton: true
      };

      window.plugins.actionsheet.show(options, function(index) {
        $('.deviceDashPoppage').fadeOut();
        return PUB.page('/timelineAlbum/'+deviceLists[index-1].uuid+'?pid='+personId);
      });
    }

  }
});