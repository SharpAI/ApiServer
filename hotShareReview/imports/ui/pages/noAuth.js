import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './noAuth.html';


Template.noAuth.events({
  'click .logout': function (e, t) {
    Meteor.logout(function(msg) {
      return Router.go('/');
    });
  }
});