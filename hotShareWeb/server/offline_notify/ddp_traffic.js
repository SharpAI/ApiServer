
Meteor.startup(function () {
  //update_raidinfo_logs(json);
  function update_raidinfo_logs(json){
      json.createdAt = Date.now();
      RaidInfoLogs.insert(json);
  }
  Meteor.methods({
    report: function(info) {
      this.unblock();
      //console.log('report info')
      //console.log(info)

      var peerData = peerCollection.findOne({clientID: info.clientID});
      info.updateBy = new Date();
      peerCollection.update({clientID:info.clientID},{$set:info},{upsert:true});

      if(info && info.total_tasks && info.total_tasks > 0){
        console.log('Camera connected')
        Devices.update({uuid: info.clientID},{$set:{camera_run:true}})
      } else if(info.total_tasks===0){
        console.log('Camera disconnected')
        Devices.update({uuid: info.clientID},{$set:{camera_run:false}})
      }

      if(info && info.version) {
        if(info.version.islatest) {
          Devices.update({uuid: info.clientID},{$set:{islatest:true}})
        }
        else {
          Devices.update({uuid: info.clientID},{$set:{islatest:false}})
        }
      }
    }
  })
})
