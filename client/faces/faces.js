var url = 'http://workaiossqn.tiegushi.com/c432cc7e-3157-11e8-8057-c81451c13caf';
var isLoading = new ReactiveVar(false);
var personArr = new ReactiveVar([]);

Template.faces.onRendered(function() {
  personArr.set([]);
  isLoading.set(true);
  Meteor.subscribe('getFaces', function() {
    isLoading.set(false);
  });
});

Template.faces.helpers({
  isLoading: function () {
    return isLoading.get();
  },
  data: function() {
    var groupIds = [];
    SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).forEach(function(item) {
      groupIds.push(item.group_id)
    });
    return Faces.findOne({group_id: {$in: groupIds}},{sort:{createdAt: -1}});
  },
  getFace: function (data) {
    if (data.faces && data.faces[0]) {
      return data.faces[0];
    }
    return {};
  },
  isMultiFaces: function(data) {
    if (data && data.faces && data.faces.length > 1) {
      return true;
    }
    return false;
  },
  formatDate: function(){
    var date = new Date(this.img_ts);
    var group_id = this.group_id;
    var time_offset = 8;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    console.log(group);
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    return date.shortTime(time_offset)
  },
});

Template.faces.events({
  'click .singleLeft': function (e) {
    Meteor.call('faceLabelAsUnknown', this._id);
  },
  'click .singleRight': function (e) {
    var self = this;
    Meteor.call('faceLabelAsPerson', self);
  },
  'click .multiLeft': function (e) {

  },
  'click .multiRight': function (e) {

  }
});