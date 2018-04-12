import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
});

Template.hello.helpers({
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    //var to = "hzhu@actiontec.com, yunhaia@gmail.com";
    //var html = Blaze.toHTML(Template.emailTemplate);  sendEmail
    //Meteor.call("sendEmail", to, html, function(error, result) {
    Meteor.call("sendEmail", function(error, result) {
      if(error){
        return console.log(error.reason);
      }else{
        console.log("success");
      }
    });
  },
});

