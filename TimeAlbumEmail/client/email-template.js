import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Template.emailTemplate.onCreated(function helloOnCreated() {
  
});

Template.emailTemplate.helpers({
  company_name() {
    return "DeepEye"
  }
});
