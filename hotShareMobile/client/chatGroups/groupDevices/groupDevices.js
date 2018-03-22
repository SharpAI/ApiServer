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
  'click .deviceItem': function(e){
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  }
});