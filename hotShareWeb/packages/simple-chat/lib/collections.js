var PRFIX = 'simple_chat_';
if (Meteor.isServer) {
  var remoteCollectionDriver = function () {
    var connectionOptions = {};
    var mongoUrl = process.env.CHAT_MONGO_URL;

    if (process.env.MONGO_OPLOG_URL)
      connectionOptions.oplogUrl = process.env.CHAT_MONGO_OPLOG_URL;
    if (!mongoUrl)
      mongoUrl = process.env.MONGO_URL;
    return new MongoInternals.RemoteCollectionDriver(mongoUrl, connectionOptions);
  };
  var options = {
    _driver: remoteCollectionDriver()
  };

  Groups = new Mongo.Collection(PRFIX + 'groups', options);
  GroupUsers = new Mongo.Collection(PRFIX + 'groups_users', options);
  MsgSession = new Mongo.Collection(PRFIX + 'msg_session');
  SimpleChat.MsgSession = MsgSession;
} else {
  withMessageHisEnable = true;
  Groups = new Mongo.Collection(PRFIX + 'groups');
  GroupUsers = new Mongo.Collection(PRFIX + 'groups_users');
  MessageTemp = new Mongo.Collection(PRFIX + 'messages_temp', { connection: null });

  checkAllGroundDBLoaded = function () {
    if (!withMessageHisEnable && Messages) {
      console.log('GroundDB: Messages is not Null');
      if (!Messages.isLoaded) {
        console.log('GroundDB: Messages.isLoaded is true;');
        return false;
      }
    }

    if (!MessagesHis || !MsgSession || !MsgAdminRelays || !GroupPhotoLabel || !CollectMessages) {
      console.log('GroundDB: initializing...');
      return false;
    }

    if (!MessagesHis.isLoaded || !MsgSession.isLoaded || !MsgAdminRelays.isLoaded || !GroupPhotoLabel.isLoaded || !CollectMessages.isLoaded) {
      var info = '';
      if (!MessagesHis.isLoaded) {
        info += 'MessagesHis';
      }

      if (!MsgSession.isLoaded) {
        info += ', MsgSession';
      }

      if (!MsgAdminRelays.isLoaded) {
        info += ', MsgAdminRelays';
      }

      if (!GroupPhotoLabel.isLoaded) {
        info += ', GroupPhotoLabel';
      }

      if (!CollectMessages.isLoaded) {
        info += ', CollectMessages';
      }

      console.log('GroundDB: ' + info + ' still loading...');
      return false;
    }
    return true;
  };
  
  checkMsgSessionLoaded = function () {
    if (!MsgSession) {
      console.log('GroundDB: MsgSession initializing...');
      return false;
    }

    if (!MsgSession.isLoaded) {
      console.log('GroundDB: MsgSession still loading...');
      return false;
    }

    return true;
  };
  
  SimpleChat.checkAllGroundDBLoaded = checkAllGroundDBLoaded;
  SimpleChat.checkMsgSessionLoaded = checkMsgSessionLoaded;

  initCollection = function () {
    //var LocalMessagesObservor = new PersistentMinimongo2(Messages, 'workai');
    //Ground.Collection(Messages, 'gdb');
    if (Messages) {
      return;
    }

    if (!withMessageHisEnable) {
      Messages = new Ground.Collection(PRFIX + 'messages', { connection: null });
    }

    MsgSession      = new Ground.Collection(PRFIX + 'msg_session', { connection: null });
    MsgAdminRelays  = new Ground.Collection(PRFIX + 'msg_admin_realy', { connection: null });
    GroupPhotoLabel = new Ground.Collection(PRFIX + 'group_photo_label', { connection: null }); // 群相册下已标注的消息
    CollectMessages = new Ground.Collection(PRFIX + 'collect_messages', { connection: null });

    console.log('Message   inited');

    SimpleChat.Messages         = Messages;
    SimpleChat.GroupPhotoLabel  = GroupPhotoLabel;
    SimpleChat.MsgSession       = MsgSession;
    SimpleChat.MessageTemp      = MessageTemp;
    SimpleChat.MsgAdminRelays   = MsgAdminRelays;
    SimpleChat.CollectMessages  = CollectMessages;

    // 历史消息
    if (withMessageHisEnable) {
      console.log('=> 聊天室启用历史消息');
      Messages = new Mongo.Collection(PRFIX + 'new_messages', { connection: null });
      MessagesHis = new Ground.Collection(PRFIX + 'messagesHis', { connection: null });

      SimpleChat.Messages = Messages;
      SimpleChat.MessagesHis = MessagesHis;

      Messages.after.insert(function (userId, doc) {
        if (doc.hasFromHistory) return;

        var id = doc._id;
        delete doc._id;
        MessagesHis.upsert({
          _id: id
        }, {
          $set: doc
        });
      });

      Messages.after.update(function (userId, doc, fieldNames, modifier, options) {
        // if (doc.hasFromHistory)
        //   return;

        var model = Messages.findOne({ _id: doc._id });
        var id = model._id;

        if (model) {
          delete model._id;
          MessagesHis.upsert({
            _id: id
          }, {
            $set: model
          });
        }
      });
      Messages.after.remove(function (userId, doc) {
        MessagesHis.remove({  _id: doc._id });
      });

      loadMoreMesage = function (where, option, limit) {
        setTimeout(function () {
          console.log('加载历史消息');
          console.log('where=' + JSON.stringify(where) + ', option=' + JSON.stringify(option));
          var lastMsg = Messages.findOne(where, {
            sort: {
              create_time: -1
            }
          });
          var lastMsgHis = MessagesHis.findOne(where, {
            sort: {
              create_time: -1
            }
          });
          if (lastMsg && lastMsgHis && (lastMsg.create_time - lastMsgHis.create_time < 0)) {
            MessagesHis.find(where, option).forEach(function (doc) {
              if (Messages.find({
                _id: doc._id
              }).count() <= 0) {
                console.log('load message from history:', doc._id);
                doc.hasFromHistory = true;
                Messages.insert(doc);
              }
            });
          }
          if (Messages.find(where, option).count() >= limit)
            return;

          MessagesHis.find(where, option).forEach(function (doc) {
            if (Messages.find({
              _id: doc._id
            }).count() <= 0) {
              console.log('load message from history:', doc._id);
              doc.hasFromHistory = true;
              Messages.insert(doc);
            }
          });
        }, 100);
      };
    } else {
      loadMoreMesage = function (where, option, limit) {};
    }

    Messages.after.insert(function (userId, doc) {
      updateMsgSession(doc);
    });
    Messages.after.update(function (userId, doc, fieldNames, modifier, options) {
      updateMsgSession(doc);
    });

    SimpleChat.withMessageHisEnable = withMessageHisEnable;
    SimpleChat.loadMoreMesage = loadMoreMesage;
  };

  Meteor.startup(function () {
    if (!Messages) {
      console.log('Meteor startup has been done ,will initCollection');
      initCollection();
    }
  });

  // 生成聊天会话
  var updateMsgSession = function (doc) {
    //console.log('updateMsgSession: doc='+JSON.stringify(doc));

    if (doc.hasFromHistory) return;
    if (!Meteor.userId()) return;

    var msgObj = null;
    switch (doc.to_type) {
      case 'group':
        //if (GroupUsers.find({group_id: doc.to.id}).count() > 0) // -> my group
        msgObj = {
          toUserId: doc.to.id,
          toUserName: doc.to.name,
          toUserIcon: doc.to.icon,
          sessionType: 'group'
        };
        break;
      case 'user':
        if (doc.form.id === Meteor.userId()) // me -> ta
          msgObj = {
            toUserId: doc.to.id,
            toUserName: doc.to.name,
            toUserIcon: doc.to.icon,
            sessionType: 'user',
            count: -1
          };
        else if (doc.to.id == Meteor.userId()) // ta - me
          msgObj = {
            toUserId: doc.form.id,
            toUserName: doc.form.name,
            // eslint-disable-next-line indent
              toUserIcon: doc.form.icon,
            sessionType: 'user'
          };
        break;
    }

    if (!msgObj)
      return;
    if (doc.to_type === 'user' && doc.to.id == Meteor.userId()) {
      //ta 被我拉黑
      if (BlackList.find({
        blackBy: Meteor.userId(),
        blacker: {
          $in: [doc.to.id]
        }
      }).count() > 0) {
        console.log(doc.to.id + '被我拉黑');
        return;
      }
    }

    msgObj.userId = Meteor.userId();
    msgObj.userName = AppConfig.get_user_name(Meteor.user());
    msgObj.userIcon = AppConfig.get_user_icon(Meteor.user());
    //msgObj.lastText = doc.type === 'image' ? '[图片]' : doc.text;
    switch (doc.type) {
      case 'image':
        msgObj.lastText = '[图片]';
        break;
      case 'text':
        msgObj.lastText = doc.text ? doc.text : '[图片]';
        break;
      case 'url':
        msgObj.lastText = '[链接]' + doc.urls[0].title;
        break;
    }
    msgObj.updateAt = doc.create_time;
    msgObj.msgcreate_time = doc.create_time;

    var msgSession = MsgSession.findOne({
      userId: Meteor.userId(),
      toUserId: msgObj.toUserId
    });
    //console.log("Frank: Meteor.userId()="+Meteor.userId()+", msgObj.toUserId="+msgObj.toUserId);
    if (msgSession) {
      //console.log("Frank: msgSession="+JSON.stringify(msgSession));
      if (msgSession.msgcreate_time && msgObj.msgcreate_time - msgSession.msgcreate_time < 0) {
        msgObj.lastText = msgSession.lastText;
        msgObj.msgcreate_time = msgSession.msgcreate_time;
      }
      msgObj.createAt = msgSession.createAt;

      if (doc.hasFromHistory != true) {
        MsgSession.update({
          _id: msgSession._id
        }, {
          $set: msgObj,
          $inc: {
            count: 1
          }
        });
        console.log('update chat session:', JSON.stringify(msgObj));
      }
    } else {
      msgObj.createAt = new Date();
      msgObj.count = 1;
      MsgSession.insert(msgObj);
      console.log('insert chat session:', JSON.stringify(msgObj));
    }
  };
}

if (Meteor.isServer) {
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

  Meteor.startup(function () {
    Groups._ensureIndex({
      'user_id': 1
    });
    GroupUsers._ensureIndex({
      'user_id': 1
    });
    GroupUsers._ensureIndex({
      'group_id': 1
    });
    GroupUsers._ensureIndex({
      'group_id': 1,
      'user_id': 1
    });
  });

  Groups.allow({
    insert: function (userId, doc) {
      if (userId && doc.creator && doc.creator.id && userId == doc.creator.id) {
        return true;
      }
      return false;
    },
    update: function (userId, doc, fields, modifier) {
      var user = Meteor.users.findOne({
        _id: userId
      });
      var isAdmin = user.profile && user.profile.userType && user.profile.userType == 'admin';
      if (!userId || !isAdmin) {
        return false;
      }
      return true;
    }
  });

  GroupUsers.allow({
    insert: function (userId, doc) {
      if (!doc.group_id) {
        return false;
      }
      var group = Groups.findOne({
        _id: doc.group_id
      });
      if (userId && group && group.creator && group.creator.id && userId == group.creator.id) {
        return true;
      }
      return false;
    },
    update: function (userId, doc, fields) {
      return _.without(fields, 'index').length === 0;
    }
  });
}

SimpleChat.Groups = Groups;
SimpleChat.GroupUsers = GroupUsers;