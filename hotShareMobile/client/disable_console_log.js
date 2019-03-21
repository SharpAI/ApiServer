if ( Meteor.isClient ){
  var console = {};
  console.log = function(){};
  console.info = function(){};
  window.console = console;
}

