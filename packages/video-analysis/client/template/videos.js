var isLoading = new ReactiveVar(false);
var limit = new ReactiveVar(20);
 
Template.dvaVideos.helpers({
  lists: function () {
    return [1,2,3];
  },
})