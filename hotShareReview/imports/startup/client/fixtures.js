import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

Meteor.startup(() => {
  // code to run on client at startup
  if (Meteor.user() == null) {
    Router.go('/');
  }
});
