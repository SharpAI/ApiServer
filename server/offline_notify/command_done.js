Meteor.startup(function () {
  Meteor.methods({
    cmd_done: function(id,result) {
      this.unblock();
      console.log('command done: '+result);
      console.log('id is: '+id)
      Commands.update({_id:id},{$set:{done:true,result:result}});
    }
  })
})
