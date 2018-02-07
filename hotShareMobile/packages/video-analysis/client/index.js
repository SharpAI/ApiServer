var template = new ReactiveVar('dvaSearch')

Template.videoAnalysis.onRendered(function () {
  Session.set('is_DVA_device_scan_model', false);
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
  },
  isPage: function(_template){
    return _template == template.get();
  }
});

Template.videoAnalysis.events({
  'click .va-ft-btn': function(e){
    var _t = e.currentTarget.id;
    template.set(_t);
  },
  'click .right': function(e){
    // import online video 
    return PUB.page('/dvaImport');
  },
  'click .left': function(e) {
    return PUB.back();
  }
});
