peerCollection = new Meteor.Collection('peer');
RaidInfoLogs = new Mongo.Collection("raidinfologs");
Commands = new Mongo.Collection("commands");
Devices = new Meteor.Collection('devices');
if(Meteor.isClient) {
  inactiveClientCollection = new Meteor.Collection('inactive')
  Session.setDefault('counter', 0);
  Meteor.startup(function(){
    Meteor.subscribe('peerInfo')
    Meteor.subscribe('inactiveClients')
  });
}
if(Meteor.isServer){
  Devices.allow({
    insert: function(userId, doc){
        return false;
    },
    update: function(userId,doc, fields, modifier) {
        //return userId == doc.userId;
        return true;
    },
    remove: function(userId, doc){
        return false;
    }
  });
  Meteor.publish('devices-by-uuid',function(uuid){
    if(!uuid){
        return this.ready();
    }
    return [
        Devices.find({uuid:uuid})
        // Meteor.users.find({username: uuid})
    ];
  });
}

