
SSR.compileTemplate('srvemailTemplate', Assets.getText('srvemail-template.html'));

Template.srvemailTemplate.onCreated(function helloOnCreated() {
  
});

Template.srvemailTemplate.helpers({
  company_name() {
    return "DeepEye"
  }
});
