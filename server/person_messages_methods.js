

Meteor.methods({
  mark_person_message_as_read:function(_id){
      var msg = AiMessages.findOne({ _id:_id});
      if(msg && msg.isRead == false){
        AiMessages.update({_id:_id},{$set:{isRead:1}});
        return 'success';
      }
      return 'failed';
  },
})
