
Template.VA_History.helpers({
  lists: function () {
    return [1,2,3,4,5,6,7,8,9,10];
  }
});

Template.VA_History.events({
  'click .va-his-item': function(e) {
    $('.va-detail').fadeIn();
  }
})