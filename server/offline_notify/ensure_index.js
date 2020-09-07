if(Meteor.isServer){
  Meteor.startup(function () {
    peerCollection._ensureIndex({clientID:1,updateBy:-1});
    Commands._ensureIndex({clientID:1,done:1,updateBy:-1});
    offlineJobs._ensureIndex({'data.clientId':1});
    offlineJobs._ensureIndex({'data.clientId':1,status:1});
    offlineJobs._ensureIndex({status:1,expiresAfter:1});
    offlineJobs._ensureIndex({status:1,after:1});
  });
}
