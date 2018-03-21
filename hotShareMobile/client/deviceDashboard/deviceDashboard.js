var date = new ReactiveVar(null);
var today         = new ReactiveVar(null);
var time_offset = new ReactiveVar(8);

var lists         = new ReactiveVar([]);
var isOut        = new ReactiveVar(false);
var limit = new ReactiveVar(200);
var ckeckInNames = new ReactiveVar([]);

Template.deviceDashboard.onRendered(function () {
  isOut.set(false);

  var now = new Date();
  var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  var group_id = Router.current().params.group_id;

  date.set(_date); //UTC日期
  today.set(_today);

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
  checkInLists: function() {
    var now = new Date();
    var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
        0, 0, 0, 0);

    var group_id = Router.current().params.group_id;

    date.set(_date); //UTC日期
    today.set(_today);

    var lists = [];
    WorkStatus.find({group_id: group_id, date: date.get()}).forEach( function (item) {
      if (item.in_time || item.out_time) {
        lists.push(item);
      }
    });
    return lists;
  },
  unCkeckLists: function() {
    var checkin_names = ckeckInNames.get();

    var group_id = Router.current().params.group_id;
    return Person.find({group_id: group_id, name: {$nin: checkin_names}},{limit: limit.get(), sort:{createAt: -1}}).fetch();
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
    if(this.out_time) {
      ts = this.out_time;
    }

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
  }
})