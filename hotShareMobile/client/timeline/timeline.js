Template.timeline.onRendered(function () {
  Meteor.subscribe('group_devices',function(){
    Session.set('groupDevicesLoading',false);
  })
});


Template.timeline.helpers({
  devices: function(){
    return Devices.find({}).fetch();
  }
});

Template.timeline.events({
  'click .deviceItem': function(e){
    return PUB.page('/timelineAlbum/'+e.currentTarget.id);
  }
})