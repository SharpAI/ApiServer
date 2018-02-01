Template.VA_Detail.helpers({
  lists: function () {
    return [1,2,3,4,5,6,7,8,9,10];
  }
});

Template.VA_Detail.events({
  'click .left': function(e){
    $('.va-detail').fadeOut();
  }
})