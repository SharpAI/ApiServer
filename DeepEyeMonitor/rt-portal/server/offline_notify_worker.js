//if (Meteor.isServer) {
//  Meteor.startup(function () {
//    var workers = Job.processJobs('offline_notification_queue', 'offline_notify',
//      function (job, cb) {
//        var data = job.data;
//        console.log(data)
//        console.log('send offline notification to '+data.clientId)
//        job.done();
//        cb();
//      })
//        /*
//          function(err) {
//            if (err) {
//              job.log("Sending failed with error" + err,
//                {level: 'warning'});
//              job.fail("" + err);
//            } else {
//              job.done();
//            }
//            // Be sure to invoke the callback
//            // when work on this job has finished
//            cb();
//          }*/
//  })
//}
