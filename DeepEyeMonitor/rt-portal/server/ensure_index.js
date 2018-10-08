if(Meteor.isServer){
  Meteor.startup(function () {
    Metrics._ensureIndex({token: 1, hour: -1});
    TotalTraffic._ensureIndex({token: 1});
    AllBoxTraffic._ensureIndex({hour: 1});
    boxMonitorTraffic._ensureIndex({hour: 1, clientID:1});
    peerCollection._ensureIndex({clientID:1,updateBy:-1});
    RAIDTotalQoE._ensureIndex({hour: 1, type:1});
    NormalTotalQoE._ensureIndex({hour: 1, type:1});
  });
}
