import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

TEST_GROUP_ID = 'd6d6db0aa8fac4b44e672c96'
Template.emailTemplate.onCreated(function helloOnCreated() {
  
});

Template.emailTemplate.helpers({
  company_name() {
    group_id = TEST_GROUP_ID
    console.log("timeLinelists group_id:", group_id)
    group = SimpleChat.Groups.findOne({_id:group_id});
    
    if (group == null){
      return ""
    }
    
    console.log("timeLinelists group", group)
    
    return group.name
  }
});
