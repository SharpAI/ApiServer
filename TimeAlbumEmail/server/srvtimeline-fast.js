SSR.compileTemplate('srvtimelinefast', Assets.getText('srvtimeline-fast.html'));

Template.srvtimelinefast.onCreated(function helloOnCreated() {
});

Template.srvtimelinefast.helpers({
  timeLinelists() {
    var ret_timeLists = []

    timeItem = CurrentTimeItem
    ret_timeLists.push(timeItem)

    return ret_timeLists

  },
  company_name() {
    return CurrentEmailCompanyName
  },
  person_name(){
    return CurrentEmailPersonName
  },
});

