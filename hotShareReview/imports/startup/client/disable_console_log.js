import { Meteor } from 'meteor/meteor'

if (Meteor.isClient && withRelease){
  var console = {};
  console.log = function(){};
  console.info = function(){};
  window.console = console;
}

