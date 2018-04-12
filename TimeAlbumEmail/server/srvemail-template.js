
SSR.compileTemplate('srvemailTemplate', Assets.getText('srvemail-template.html'));

Template.srvemailTemplate.onCreated(function helloOnCreated() {
  
});

Template.srvemailTemplate.helpers({
  company_name() {
    group_id = CurrentGroupId
    group = SimpleChat.Groups.findOne({_id:group_id});
    
    return group.name
  }
});
