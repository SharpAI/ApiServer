import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  process.env.MAIL_URL = 'smtp://postmaster%40tiegushi.com:a7e104e236965118d8f1bd3268f36d8c@smtp.mailgun.org:587'
});


Meteor.publish('timelists', function() {
  return CheckSite.find();
}); 