if (Meteor.isServer) {
  Meteor.startup(function () {
    var workers = Job.processJobs('offline_notification_queue', 'offline_notify',
      function (job, cb) {

        console.log('send offline notification')
        var data = job.data;
        console.log(data)
        var uuid = data.clientId
        console.log('send offline notification to '+uuid)
        user = Meteor.users.findOne({username: uuid})
        if(user){
          userGroups = SimpleChat.GroupUsers.findOne({user_id: user._id})
          device = Devices.findOne({"uuid" : uuid})
          if(userGroups && device){
            //sharpai_pushnotification("notify_knownPeople", {active_time:active_time, group_id:userGroup.group_id, group_name:group_name, person_name:person_name}, null, ai_person_id)
            sharpai_pushnotification("device_offline",userGroups,uuid)
          }
        }
        //group = SimpleChat.Groups.findOne({_id: userGroup.group_id})
        job.done();
        cb();
      })
        /*
          function(err) {
            if (err) {
              job.log("Sending failed with error" + err,
                {level: 'warning'});
              job.fail("" + err);
            } else {
              job.done();
            }
            // Be sure to invoke the callback
            // when work on this job has finished
            cb();
          }*/
  })
}
