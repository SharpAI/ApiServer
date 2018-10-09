

Meteor.methods({
  cmd_done: function(id,result) {
    this.unblock();
    console.log('command done: '+result);
    Commands.update({_id:id},{$set:{done:true}});
  }
})
