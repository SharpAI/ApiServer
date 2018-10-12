Template.timeline.onRendered(function () {
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  })
});


Template.timeline.helpers({
  isLoading:function(){
    if (Session.get('groupDevicesLoading') === false) {
      return false;
    }
    return true;
  },
  deviceSupportOnlineOffline: function(online){
    return typeof online ==='boolean'
  },
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
  }
});

Template.timeline.events({
  'click .back': function(){
    return PUB.back();
  },
  'click .deviceItem': function(e){
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  }
})
