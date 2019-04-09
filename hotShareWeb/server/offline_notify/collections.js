peerCollection = new Meteor.Collection('peer');
RaidInfoLogs = new Mongo.Collection("raidinfologs");
Commands = new Mongo.Collection("commands");
BoxVersion = new Meteor.Collection('boxversion');
if (Meteor.isServer) {
  Meteor.publish('peers-by-uuid',function(uuid){
    if(!this.userId || !uuid){
        return this.ready();
    }
    return peerCollection.find({clientID: uuid});
  });
}
/*
if(Meteor.isClient) {
  inactiveClientCollection = new Meteor.Collection('inactive')
  Session.setDefault('counter', 0);
  Meteor.startup(function(){
    Meteor.subscribe('peerInfo')
    Meteor.subscribe('inactiveClients')
  });
}*/
