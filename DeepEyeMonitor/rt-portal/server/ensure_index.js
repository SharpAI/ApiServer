if(Meteor.isServer){
  Meteor.startup(function () {
    peerCollection._ensureIndex({clientID:1,updateBy:-1});
    Commands._ensureIndex({clientID:1,done:1,updateBy:-1});
    offlineJobs._ensureIndex({'data.clientId':1});
    offlineJobs._ensureIndex({'data.clientId':1,status:1});
  });
}
