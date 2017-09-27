// 自动估算位置(随机)
var calcPosition = function(max_X,min_X, max_Y,min_Y){
  console.log(max_Y)
  console.log(max_X)
  var cL = function(max, min){
    return  Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return {
    left: cL(max_X, min_X),
    bottom: cL(max_Y, min_Y)
  };
}
Template.VEOffice.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  Session.set('theCurrentDay',date); //UTC日期
  Session.set('today',displayDate); //今天

  var group_id = Router.current().params._id;
  Meteor.subscribe('WorkStatusByGroup',date,group_id,'in');
  Meteor.subscribe('get-group',group_id);
});

Template.VEOffice.helpers({
  lists: function(){
    var group_id = Router.current().params._id;
    var date = Session.get('theCurrentDay')
    return WorkStatus.find({date: date,group_id: group_id, status:'in'}).fetch();
  },
  calcPosition: function(){
    var max_X = window.screen.width - 60,
        min_X = 0,
        max_Y = window.screen.height - 118,
        min_Y = 0;
    var position = calcPosition(max_X,min_X, max_Y,min_Y);
    return 'left:'+ position.left + 'px;bottom:'+ position.bottom + 'px';
  },
  getPersonImg: function(){
    return this.in_image || this.out_image
  },
  getGroupName: function(){
    var group_id = Router.current().params._id;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    if(group && group.name){
      return group.name;
    }
    return '办公室';
  }
});

Template.VEOffice.events({
  // 处理点击时，提高显示层级
  'click .officeItem': function(e){
    $('.officeItem').css('z-index','0').find('.person').removeClass('selected');
    $(e.currentTarget).css('z-index','9').find('.person').addClass('selected');
  }
});