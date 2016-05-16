if ( Meteor.isClient ){
  var console = {};
  console.log = function(){};
  window.console = console;
}

