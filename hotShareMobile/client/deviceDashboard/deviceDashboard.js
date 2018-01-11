var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var today         = new ReactiveVar(null);

var group        = new ReactiveVar({});
var lists         = new ReactiveVar([]);
var isOut        = new ReactiveVar(true);

Template.deviceDashboard.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  var group_id = Router.current().params.group_id;

  theCurrentDay.set(date); //UTC日期
  theDisplayDay.set(displayDate); //当前显示的日期
  today.set(displayDate);

  Meteor.subscribe('WorkStatusByGroup',date, group_id,{
     onReady:function(){
      var _lists = WorkStatus.find({group_id: group_id, date: date}).fetch();
      console.log(_lists);
      lists.set(_lists);
    }
  });

});

Template.deviceDashboard.helpers({
  lists: function(){
    return lists.get();
  },
  groupName: function(){
    return Session.get('deviceDashboardTitle');
  },
  isOut: function(){
    return isOut.get();
  },
  isShowOut: function(){
    return isOut.get() && this.out_image;
  },
  isShowIn: function(){
    return !isOut.get() && this.in_image;
  },
  getTime: function(ts){
    if(!ts || ts == null || ts == 0){
      return '-/-';
    }
    
    var time_offset = 8;
    var _group = group.get();
    if (_group && _group.offsetTimeZone) {
      time_offset = _group.offsetTimeZone;
    }
    var time = new Date(ts);
    return time.shortTime(time_offset);
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
  }
})