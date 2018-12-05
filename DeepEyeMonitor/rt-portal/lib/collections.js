peerCollection = new Meteor.Collection('peer');
RaidInfoLogs = new Mongo.Collection("raidinfologs");
Commands = new Mongo.Collection("commands");
Devices = new Meteor.Collection('devices');
BoxVersion = new Meteor.Collection('boxversion');
GroupUsers = new Mongo.Collection('simple_chat_groups_users');
if(Meteor.isClient) {
  inactiveClientCollection = new Meteor.Collection('inactive')
  Session.setDefault('counter', 0);
  Meteor.startup(function(){
    Meteor.subscribe('peerInfo')
    Meteor.subscribe('inactiveClients')
    Meteor.subscribe('group_devices');
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
  BoxVersion.allow({
    insert: function(res, doc){
      return true;
    },
    update: function(res, doc, fields, modifier) {
      //return userId == doc.userId;
      return true;
    },
    remove: function(res, doc){
      return false;
    }
  });
  Meteor.publish('version-isnew',function(){
    return [
      BoxVersion.find({},{sort: {createTime: -1}, limit: 10})
        // Meteor.users.find({username: uuid})
    ];
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
  Meteor.publish('group_devices',function(){
      console.log(this.userId);
      
    if(this.userId){
        var groupIds = []
        var groups = GroupUsers.find({user_id: this.userId}).fetch();
        for(var i = 0;i< groups.length; i++){
            groupIds.push(groups[i].group_id);
        }
        if(groupIds){
            return [
                Devices.find({groupId: {$in:groupIds}}, {fields: {'_id': 1, 'uuid': 1, 'groupId': 1}}),
                GroupUsers.find({user_id: this.userId}, {fields: {'_id': 1, 'group_id': 1, 'user_id': 1}})
            ];
        }
    }
    return this.ready();
  });
}

