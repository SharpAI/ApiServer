var PRFIX= 'simple_chat_';
if(Meteor.isServer){
  var remoteCollectionDriver = function(){
    var connectionOptions = {};
    var mongoUrl = process.env.CHAT_MONGO_URL;

    if (process.env.MONGO_OPLOG_URL)
      connectionOptions.oplogUrl = process.env.CHAT_MONGO_OPLOG_URL;
    if (!mongoUrl)
      mongoUrl = process.env.MONGO_URL
    return new MongoInternals.RemoteCollectionDriver(mongoUrl, connectionOptions);
  };
  var options = {_driver: remoteCollectionDriver()};

  Groups = new Mongo.Collection(PRFIX + 'groups', options);
  GroupUsers = new Mongo.Collection(PRFIX + 'groups_users', options);
  MsgSession = new Mongo.Collection(PRFIX + 'msg_session');
}else{
  Messages = new Mongo.Collection(PRFIX + 'messages', {connection: null});
  MsgSession = new Mongo.Collection(PRFIX + 'msg_session');
  Groups = new Mongo.Collection(PRFIX + 'groups');
  GroupUsers = new Mongo.Collection(PRFIX + 'groups_users');

  Meteor.startup(function() {
    //var LocalMessagesObservor = new PersistentMinimongo2(Messages, 'workai');
    Ground.Collection(Messages, 'gdb');
  });
}

if(Meteor.isServer){
  // Messages.allow({
  //   insert: function(userId, doc){
  //     var result =  userId && userId === doc.form.id;
  //     if(result){
  //       var sess = MsgSession.findOne({user_id: userId, 'to.id': doc.to.id, type: doc.to_type});
  //       if(sess){
  //         MsgSession.update({_id: sess._id}, {
  //           $set: {
  //             text: doc.text,
  //             update_time: new Date()
  //           },
  //           $inc: {msg_count: 1}
  //         });
  //       }else{
  //         MsgSession.insert({
  //           user_id: doc.form.id,
  //           user_name: doc.form.name,
  //           user_icon: doc.form.icon,
  //           text: doc.text,
  //           update_time: new Date(),
  //           msg_count: 1,
  //           type: doc.to_type,
  //           to: doc.to
  //         });
  //       }
  //     }

  //     return result;
  //   },
  //   update: function (userId, doc, fields, modifier) {
  //     return userId === doc.form.id;
  //   },
  //   remove: function (userId, doc) {
  //     return userId === doc.form.id;
  //   }
  // });

  Meteor.startup(function(){
    Groups._ensureIndex({'user_id': 1});
    GroupUsers._ensureIndex({'user_id': 1});
    GroupUsers._ensureIndex({'group_id': 1});
    GroupUsers._ensureIndex({'group_id': 1, 'user_id': 1});
  });

  Groups.allow({
     insert: function(userId, doc) {
      if(userId && doc.creator && doc.creator.id && userId == doc.creator.id) {
        return true;
      }
      return false;
     },
     update: function (userId, doc, fields, modifier) {
      var user = Meteor.users.findOne({_id: userId})
      var isAdmin = user.profile && user.profile.userType && user.profile.userType == 'admin';
      if(!userId || !isAdmin){
        return false
      }
      return true;
    }
  });

  GroupUsers.allow({
    insert: function(userId, doc) {
      if (!doc.group_id) {
        return false;
      }
      var group = Groups.findOne({_id: doc.group_id});
      if ( userId &&  group && group.creator && group.creator.id && userId == group.creator.id) {
        return true;
      }
      return false;
    }
  });
}

if(Meteor.isClient){
  SimpleChat.Messages = Messages;
}

SimpleChat.MsgSession = MsgSession;
SimpleChat.Groups = Groups;
SimpleChat.GroupUsers = GroupUsers;

