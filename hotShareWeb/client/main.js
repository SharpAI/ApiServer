if (Meteor.isClient) {
  Session.set("DocumentTitle",'点圈');
  Deps.autorun(function(){
    document.title = Session.get("DocumentTitle");
  });
}

Tracker.autorun(function(){
  if(Meteor.userId())
    Meteor.subscribe('loginFeeds');
});