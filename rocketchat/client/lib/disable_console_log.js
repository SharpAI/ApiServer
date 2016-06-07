if ( Meteor.isClient ){
  var console = {};
  console.log = function(){};
  console.error = function(){};
  console.info = function(){};
  window.console = console;
}

