Template.homePage.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  Session.set('theCurrentDay',date); //UTC日期
  Session.set('theDisplayDay',displayDate); //当前显示的日期
  Session.set('today',displayDate); //今天
  Meteor.subscribe('userGroups');
  Meteor.subscribe('WorkStatus',date,{
     onReady:function(){
      Session.set('WorkStatusLoading',false);
    }
  });
});

Template.homePage.helpers({
  companys: function(){
    var lists = [];
    SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach(function(item){
      var group = SimpleChat.Groups.findOne({_id: item.group_id});
      if(group) {
        lists.push(group);
      }
    });
    return lists;
  },
  onlyOneCompany: function(){
    var lists = Template.homePage.__helpers.get('companys')();
    if(lists.length == 1){
      return 'width: 100%;';
    }
    return '';
  },
  getGroupInOutTime:function() {
    var group_intime = '09:00';
    var group_outtime = '18:00';
    group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
    if (this.group_intime) {
      group_intime = this.group_intime;
    }
    if (this.group_outtime) {
      group_outtime = this.group_outtime;
    }
    return group_intime+' - '+group_outtime;
  },
  getInCount: function(){
    var group_id = this._id;
    return WorkStatus.find({group_id: this._id, status: 'in'}).count();
  },
  getOutCount: function(){
    return WorkStatus.find({group_id: this._id, status: 'out'}).count();
  }
});

Template.homePage.events({
  'click .companyItem': function(e){
    Session.set('workstatus_group', this);
    return workStatusPopPage.show();
  }
})

