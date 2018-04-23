CurrentEmailTitle = ''

SSR.compileTemplate('srvemailTemplateFast', Assets.getText('srvemail-template-fast.html'));

Template.srvemailTemplateFast.onCreated(function helloOnCreated() {
  
});

Template.srvemailTemplateFast.helpers({
  company_name() {
    return CurrentEmailCompanyName
  },
  person_name(){
    return CurrentEmailPersonName
  },
  job_date2(){
    group_id = CurrentGroupId
    group = SimpleChat.Groups.findOne({_id:group_id});
    
    if (group == null){
      return ""
    }
    
    now = new Date()
    localDate = LocalDateTimezone(now, group.offsetTimeZone);
    console.log(localDate.getFullYear(), localDate.getMonth() , localDate.getDate(), 
      localDate.getHours(), localDate.getMinutes(), localDate.getSeconds())

    return localDate.getFullYear()+ "-"+ localDate.getMonth() + "-" + localDate.getDate() 
  }
});
