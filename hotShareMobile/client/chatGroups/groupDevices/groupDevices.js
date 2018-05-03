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
  'click #goTimelime': function(e){
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  },
  'click .deviceItem > label':function(){
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
    Devices.update({_id:this._id},{
      $set:{
        name:newName
      }
    })
    return PUB.back();
  }
})