//if (Meteor.isServer) {
//  offlineJobs = JobCollection('offline_notification_queue');
//
//  Meteor.startup(function () {
//    // Normal Meteor publish call, the server always
//    // controls what each client can see
//    //Meteor.publish('offline_notification_queue', function () {
//    //  return offlineJobs.find({});
//    //});
//
//    // Start the myJobs queue running
//    offlineJobs.startJobServer();
//  });
//  cancel_offline_notification = function(clientId){
//    var doc = offlineJobs.find({'data.clientId':clientId,status:'waiting'})
//    var cancelList = doc.map(function(item){
//      return item._id
//    })
//    offlineJobs.cancelJobs(cancelList)
//    offlineJobs.removeJobs(cancelList)
//    console.log(offlineJobs.find({'data.clientId':clientId}).fetch())
//  }
//  create_offline_notification = function(clientId,data){
//    data['clientId'] = clientId;
//    var job = Job(offlineJobs, 'offline_notify', data);
//
//    // Set some properties of the job and then submit it
//    job.priority('normal')
//      .retry({ retries: 5,
//        wait: 1*60*1000 })  // 1 minutes between attempts
//      .delay(2*1000)          // inMs
//      .save();              // Commit it to the server
//    var job_id = job.doc._id
//    console.log(job)
//    console.log(job_id)
//    console.log(offlineJobs.find({'data.clientId':clientId}).fetch())
//  }
//}
