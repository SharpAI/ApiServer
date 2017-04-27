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
  // MsgSession = new Mongo.Collection(PRFIX + 'msg_session');
}else{
  Groups = new Mongo.Collection(PRFIX + 'groups');
  GroupUsers = new Mongo.Collection(PRFIX + 'groups_users');
  MessageTemp = new Mongo.Collection(PRFIX + 'messages_temp', { connection: null });

  Meteor.startup(function() {
    //var LocalMessagesObservor = new PersistentMinimongo2(Messages, 'workai');
    //Ground.Collection(Messages, 'gdb');

    Messages = new Ground.Collection(PRFIX + 'messages', { connection: null })
    MsgSession = new Ground.Collection(PRFIX + 'msg_session', { connection: null });
    Messages.after.insert(function (userId, doc) {updateMsgSession(doc);});
    Messages.after.update(function (userId, doc, fieldNames, modifier, options) {updateMsgSession(doc);});

    SimpleChat.Messages = Messages;
    SimpleChat.MsgSession = MsgSession;
    SimpleChat.MessageTemp = MessageTemp;
  });

  // 生成聊天会话
  var updateMsgSession = function(doc){
    if (!Meteor.userId())
      return;

    var msgObj = null;
    switch(doc.to_type){
      case 'group':
        //if (GroupUsers.find({group_id: doc.to.id}).count() > 0) // -> my group
        msgObj = {toUserId: doc.to.id, toUserName: doc.to.name, toUserIcon: doc.to.icon, sessionType: 'group'};
        break;
      case 'user':
        if (doc.form.id === Meteor.userId()) // me -> ta
          msgObj = {toUserId: doc.to.id, toUserName: doc.to.name, toUserIcon: doc.to.icon, sessionType: 'user', count: -1};
        else if (doc.to.id == Meteor.userId()) // ta - me
          msgObj = {toUserId: doc.form.id, toUserName: doc.form.name, toUserIcon: doc.form.icon, sessionType: 'user'};
        break;
    }

    if (!msgObj)
      return;
    if (doc.to_type === 'user' && doc.to.id == Meteor.userId()) {
      //ta 被我拉黑
      if(BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [doc.to.id]}}).count() === 0){
        console.log(doc.to.id+'被我拉黑');
        return;
      }
    }

    msgObj.userId = Meteor.userId();
    msgObj.userName = AppConfig.get_user_name(Meteor.user());
    msgObj.userIcon = AppConfig.get_user_icon(Meteor.user());
    msgObj.lastText = doc.type === 'image' ? '[图片]' : doc.text;
    msgObj.updateAt = new Date();

    var msgSession = MsgSession.findOne({userId: Meteor.userId(), toUserId: msgObj.toUserId});
    if (msgSession){
      msgObj.createAt = msgSession.createAt;
      MsgSession.update({_id: msgSession._id}, {$set: msgObj, $inc: {count: 1}});
      console.log('update chat session:', msgObj);
    } else {
      msgObj.createAt = new Date();
      msgObj.count = 1;
      MsgSession.insert(msgObj);
      console.log('insert chat session:', msgObj);
    }
  };
}

if(Meteor.isServer){
  Meteor.startup(function(){
    Groups._ensureIndex({'user_id': 1});
    GroupUsers._ensureIndex({'user_id': 1});
    GroupUsers._ensureIndex({'group_id': 1});
    GroupUsers._ensureIndex({'group_id': 1, 'user_id': 1});
  });
}

SimpleChat.Groups = Groups;
SimpleChat.GroupUsers = GroupUsers;
