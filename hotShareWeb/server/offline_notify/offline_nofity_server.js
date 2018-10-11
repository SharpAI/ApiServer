if (Meteor.isServer) {
  offlineJobs = JobCollection('offline_notification_queue');

  Meteor.startup(function () {
    offlineJobs.startJobServer();
  });
  cancel_offline_notification = function(clientId){
    var doc = offlineJobs.find({'data.clientId':clientId,status:'waiting'}).fetch()
    console.log(doc)
    var cancelList = doc.map(function(item){
      return item._id
    })
    offlineJobs.cancelJobs(cancelList)
    offlineJobs.removeJobs(cancelList)
    console.log(offlineJobs.find({'data.clientId':clientId,status:'waiting'}).fetch())
    //console.log(offlineJobs.find(docs))
  }
  create_offline_notification = function(clientId,data){
    data['clientId'] = clientId;
    var job = Job(offlineJobs, 'offline_notify', data);

    // Set some properties of the job and then submit it
    job.priority('high')
      .retry({ retries: 5,
        wait: 1*60*1000 })  // 1 minutes between attempts
      .delay(2*1000)          // inMs
      .save();              // Commit it to the server
    console.log(job.doc)
  }
}
