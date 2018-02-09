// var template = new ReactiveVar('dvaSearch')

Template.videoAnalysis.onRendered(function () {
  Session.set('is_DVA_device_scan_model', false);
  Session.set('DVA_Index_Foot','dvaSearch')
  if( Session.get('DVA_Last_Page') &&  Session.get('DVA_Last_Page') != '') {
    Session.set('DVA_Index_Foot',Session.get('DVA_Last_Page'));
    Session.set('DVA_Last_Page', null);
  }
});

Template.videoAnalysis.helpers({
  template: function() {
    return Session.get('DVA_Index_Foot');
  },
  currTemp: function(_t){
    if( _t ==  Session.get('DVA_Index_Foot') ){
      return 'active';
    }
    return '';
  },
  isPage: function(_template){
    return _template == Session.get('DVA_Index_Foot');
  }
});

Template.videoAnalysis.events({
  'click .va-ft-btn': function(e){
    var _t = e.currentTarget.id;
    Session.set('DVA_Index_Foot',_t);
  },
  'click .right': function(e){
    // import online video 
    Session.set('DVA_Last_Page', Session.get('DVA_Index_Foot'));
    return PUB.page('/dvaImport');
  },
  'click .left': function(e) {
    return PUB.back();
  }
});
