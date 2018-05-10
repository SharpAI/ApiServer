SSR.compileTemplate('srvtimelinefast', Assets.getText('srvtimeline-fast.html'));

Template.srvtimelinefast.onCreated(function helloOnCreated() {
});

Template.srvtimelinefast.helpers({
  hasPersonList: function(personList) {
    return personList.length > 0;
  }
});