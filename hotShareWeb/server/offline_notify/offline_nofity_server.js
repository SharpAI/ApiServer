if (Meteor.isServer) {
  offlineJobs = JobCollection('offline_notification_queue');

  Meteor.startup(function () {
    offlineJobs.startJobServer();
  });
  /*
   * 如果clientId有需要发送的消息，也就是曾经掉线过，而且没通知过，则返回 true
   * 如果clientId没有要发送的消息，则返回false
   */
  cancel_offline_notification = function(clientId){
    var doc = offlineJobs.find({'data.clientId':clientId,status:'waiting'}).fetch()
    console.log(doc)
    if(!doc || doc.length <= 0){
      return false;
    }
    var cancelList = doc.map(function(item){
      return item._id
    })
    offlineJobs.cancelJobs(cancelList)
    offlineJobs.removeJobs(cancelList)
    console.log(offlineJobs.find({'data.clientId':clientId,status:'waiting'}).fetch())
    return true;
    //console.log(offlineJobs.find(docs))
  }
  create_offline_notification = function(clientId,data){
    data['clientId'] = clientId;
    var job = Job(offlineJobs, 'offline_notify', data);

    // Set some properties of the job and then submit it
    // 离线消息等待5分钟再发，避免网络抖动或者服务器重启动带来的频繁报告
    job.priority('high')
      .retry({ retries: 5,
        wait: 1*60*1000 })  // 1 minutes between attempts
      .delay(5*60*1000)     // inMs
      .save();              // Commit it to the server
    console.log(job.doc)
  }
}
