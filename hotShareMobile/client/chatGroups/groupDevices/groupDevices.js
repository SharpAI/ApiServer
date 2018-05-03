Template.groupDevices.onRendered(function () {
  var group_id = Router.current().params._id;
  Meteor.subscribe('device_by_groupId', group_id);
});

Template.groupDevices.helpers({
  lists: function() {
    var group_id = Router.current().params._id;
    return Devices.find({groupId: group_id}).fetch();
  }
});


Template.groupDevices.events({
  'click .back': function(){
    return PUB.back();
  },
  'click .goTimelime': function(e){
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  },
  'click .goEdit':function(){
    var self = this;
    if(!self.name){
      self.name = '未知设备';
    }
    Session.set('curDevice',self);
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/setDevicename');
  }
});
Template.setDevicename.events({
  'click .left-btn':function(){
    PUB.back();
  },
  'click .right-btn':function(){
    $('.setGroupname-form').submit();
  },
  'submit .setGroupname-form':function(e){
    e.preventDefault();
    var newName = e.target.text.value;
    if(newName == ''){
      PUB.toast('请输入设备名');
      return;
    }
    if(newName == this.name){
      PUB.toast('设备名没有修改');
      return;
    }
    Meteor.call('change_device_name',this._id,this.uuid,this.groupId,newName,function(err){
      if(err){
        console.log(err);
        PUB.toast('修改失败，请重试');
      }else{
        return PUB.back();
      }
    }) 
  }
})