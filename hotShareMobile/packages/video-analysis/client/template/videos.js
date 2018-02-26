var isLoading = new ReactiveVar(false);
var limit = new ReactiveVar(20);
 
Template.dvaVideos.helpers({
  lists: function () {
    return [1,2,3];
  },
});

Template.dvaVideos.events({
  'click .va-video-lists': function(e) {
    var id = 1;
    return PUB.page('/dva/video/'+id);
  }
});