import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    var to = "hzhu@actiontec.com, yunhaia@gmail.com";
    var html = Blaze.toHTML(Template.emailTemplate);  
    Meteor.call("sendHtmlEmail", to, html, function(error, result) {
      if(error){
        return console.log(error.reason);
      }else{
        console.log("success");
      }
    });
  },
});

/*
Meteor.setInterval(function tickUpdate() {
  console.log("tickUpdate")
  var to = "hzhu@actiontec.com";
  var html = Blaze.toHTML(Template.emailTemplate);  
  Meteor.call("sendHtmlEmail", to, html, function(error, result) {
    if(error){
      return console.log(error.reason);
    }else{
      console.log("success");
    }
  });
        
}, 3600);
*/