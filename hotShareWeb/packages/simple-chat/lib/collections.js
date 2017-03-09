var PRFIX= '_simple_chat_';
Messages = new Mongo.Collection(PRFIX + 'messages');
MsgSession = new Mongo.Collection(PRFIX + 'msg_session');
Groups = new Mongo.Collection(PRFIX + 'groups');
GroupUsers = new Mongo.Collection(PRFIX + 'groups_users');

if(Meteor.isServer){
  Messages.allow({
    insert: function(userId, doc){
      var result =  userId && userId === doc.form.id;
      if(result){
        var sess = MsgSession.findOne({user_id: userId, 'to.id': doc.to.id, type: doc.to_type});
        if(sess){
          MsgSession.update({_id: sess._id}, {
            $set: {
              text: doc.text,
              update_time: new Date()
            },
            $inc: {msg_count: 1}
          });
        }else{
          MsgSession.insert({
            user_id: doc.form.id,
            user_name: doc.form.name,
            user_icon: doc.form.icon,
            text: doc.text,
            update_time: new Date(),
            msg_count: 1,
            type: doc.to_type,
            to: doc.to
          });
        }
      }

      return result;
    },
    update: function (userId, doc, fields, modifier) {
      return userId === doc.form.id;
    },
    remove: function (userId, doc) {
      return userId === doc.form.id;
    }
  });
}