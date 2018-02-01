var template = new ReactiveVar('VA_Search')

Template.videoAnalysis.onRendered(function () {
  

});

Template.videoAnalysis.helpers({
  template: function() {
    return template.get();
  },
  currTemp: function(_t){
    if( _t == template.get() ){
      return 'active';
    }
    return '';
  }
});

Template.videoAnalysis.events({
  'click .va-ft-btn': function(e){
    var _t = e.currentTarget.id;
    template.set(_t);
  }
});
