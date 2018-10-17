//Meteor.startup(function () {
//  //update_raidinfo_logs(json);
//  function update_raidinfo_logs(json){
//      json.createdAt = Date.now();
//      RaidInfoLogs.insert(json);
//  }
//  Meteor.methods({
//    report: function(info) {
//      this.unblock();
//      console.log('report info')
//      console.log(info)
//
//      var peerData = peerCollection.findOne({clientID: info.clientID});
//      info.updateBy = new Date();
//      peerCollection.update({clientID:info.clientID},{$set:info},{upsert:true});
//    }
//  })
//})
