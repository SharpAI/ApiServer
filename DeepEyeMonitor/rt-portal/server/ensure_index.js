if(Meteor.isServer){
  Meteor.startup(function () {
    peerCollection._ensureIndex({clientID:1,updateBy:-1});
  });
}
