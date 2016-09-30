if (Meteor.isClient) {
  Session.set("DocumentTitle",'故事贴');
  Deps.autorun(function(){
    document.title = Session.get("DocumentTitle");
  });
}