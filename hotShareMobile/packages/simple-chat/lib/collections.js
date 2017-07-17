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
    MsgAdminRelays = new Ground.Collection(PRFIX + 'msg_admin_realy', { connection: null });

    SimpleChat.Messages = Messages;
    SimpleChat.MsgSession = MsgSession;
    SimpleChat.MessageTemp = MessageTemp;
    SimpleChat.MsgAdminRelays = MsgAdminRelays;
    
    // 历史消息
    withMessageHisEnable = true;
    if (withMessageHisEnable){
      console.log('=> 聊天室启用历史消息');
      Messages = new Mongo.Collection(PRFIX + 'new_messages', { connection: null })
      MessagesHis = new Ground.Collection(PRFIX + 'messagesHis', { connection: null });
      SimpleChat.Messages = Messages;
      SimpleChat.MessagesHis = MessagesHis;

      Messages.after.insert(function (userId, doc) {
        if (doc.hasFromHistory)
          return;

        var id = doc._id;
        delete doc._id;
        MessagesHis.upsert({_id: id}, {$set: doc});
      });
      Messages.after.update(function (userId, doc, fieldNames, modifier, options) {
        if (doc.hasFromHistory)
          return;

        var model = Messages.findOne({_id: doc._id});
        var id = model._id;

        if (model){
          delete model._id;
          MessagesHis.upsert({_id: id}, {$set: model});
        }
      });
      Messages.after.remove(function (userId, doc){
        MessagesHis.remove({_id: doc._id});
      });

      loadMoreMesage = function(where, option, limit){
        Meteor.setTimeout(function(){
          var lastMsg = Messages.findOne(where,{sort: {create_time: -1}});
          var lastMsgHis = MessagesHis.findOne(where,{sort: {create_time: -1}});
          if (lastMsg && lastMsgHis && (lastMsg.create_time - lastMsgHis.create_time < 0)) {
            MessagesHis.find(where, option).forEach(function(doc) {
            if (Messages.find({_id: doc._id}).count() <= 0){
                console.log('load message from history:', doc._id);
                doc.hasFromHistory = true;
                Messages.insert(doc);
              }
            });
          }
          if (Messages.find(where, option).count() >= limit)
            return;

          MessagesHis.find(where, option).forEach(function(doc) {
            if (Messages.find({_id: doc._id}).count() <= 0){
              console.log('load message from history:', doc._id);
              doc.hasFromHistory = true;
              Messages.insert(doc);
            }
          });
        }, 100);
      };
    } else {
      loadMoreMesage = function(where, option, limit){};
    }

    Messages.after.insert(function (userId, doc) {updateMsgSession(doc);});
    Messages.after.update(function (userId, doc, fieldNames, modifier, options) {updateMsgSession(doc);});
  });

  // 生成聊天会话
  var updateMsgSession = function(doc){
    console.log('updateMsgSession');

    if (doc.hasFromHistory)
      return;
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
      if(BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [doc.to.id]}}).count() > 0){
        console.log(doc.to.id+'被我拉黑');
        return;
      }
    }

    msgObj.userId = Meteor.userId();
    msgObj.userName = AppConfig.get_user_name(Meteor.user());
    msgObj.userIcon = AppConfig.get_user_icon(Meteor.user());
    msgObj.lastText = doc.type === 'image' ? '[图片]' : doc.text;
    switch(doc.type){
      case 'image':
        msgObj.lastText = '[图片]';
        break;
      case 'text':
        msgObj.lastText = doc.text;
        break;
      case 'url':
        msgObj.lastText = '[链接]' + doc.urls[0].title;
        break;
    }
    msgObj.updateAt = new Date();
    msgObj.msgcreate_time = doc.create_time;

    var msgSession = MsgSession.findOne({userId: Meteor.userId(), toUserId: msgObj.toUserId});
    if (msgSession){
      if (msgSession.msgcreate_time && msgObj.msgcreate_time - msgSession.msgcreate_time < 0 ) {
        msgObj.lastText = msgSession.lastText;
        msgObj.msgcreate_time = msgSession.msgcreate_time;
      }
      msgObj.createAt = msgSession.createAt;

      if (doc.hasFromHistory != true){
        MsgSession.update({_id: msgSession._id}, {$set: msgObj, $inc: {count: 1}});
        console.log('update chat session:', msgObj);
      }
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

  Groups.allow({
     update: function (userId, doc, fields, modifier) {
      var user = Meteor.users.findOne({_id: userId})
      var isAdmin = user.profile && user.profile.userType && user.profile.userType == 'admin';
      if(!userId || !isAdmin){
        return false
      }
      return true;
    }
  });
}

SimpleChat.Groups = Groups;
SimpleChat.GroupUsers = GroupUsers;
