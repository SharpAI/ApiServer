var limit = new ReactiveVar(20);
var isLoading = new ReactiveVar(false);

Template.VA_History.onRendered(function() {
  isLoading.set(true);
  Meteor.subscribe('dva_queue_lists', limit.get(), function() {
    isLoading.set(false);
  });
});

Template.VA_History.helpers({
  lists: function () {
    // return [1,2,3,4,5,6,7,8,9,10];
    return DVA_QueueLists.find({userId: Meteor.userId()},{limit:limit.get(), sort:{createdAt: -1}}).fetch();
  },
  isStatus: function(status){
    return this.status = status;
  },
  getDate: function() {
    var d = new Date(this.createdAt);
    return d.parseDate('YYYY-MM-DD');
  },
  getTime: function() {
    var d = new Date(this.createdAt);
    return d.parseDate('hh:ss');
  },
  isLoading: function() {
    return isLoading.get();
  }
});

Template.VA_History.events({
  'click .va-his-item': function(e) {
    // $('.va-detail').fadeIn();
    PUB.page('/dvaDetail/'+this._id);
  }
})