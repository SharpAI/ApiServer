
Router.route('/api/dva/task', {where: 'server'})
.get(function () {
  var req = this.request;
  var res = this.response;

  var queryTask = DVA_QueueLists.findOne({status:'pendding'},{sort: {createdAt:1}});

  var result = {};
  if(queryTask){
    var devices = DVA_Devices.find({userId: queryTask.userId},{fields:{
      domain:1,
      ipv4Addresses:1,
      name:1,
      hostname:1,
      port:1
    }}).fetch();
    result = {
      taskId: queryTask._id,
      imgUrl: queryTask.imgUrl,
      devices: devices || []
    }
  } else {
    result = {"result":"error","code": "3001","reason": "no pendding query task" };
  }
  return res.end(JSON.stringify(result));
})
.post(function() {
  var req = this.request;
  var res = this.response;
  var data = req.body;
  
  console.log('dva tsak POST: '+JSON.stringify(data));

  res.writeHead(200, {
    'Content-Type': 'application/json'
  });


  // step1. 校验数据正确性
  if(!data.hasOwnProperty('status') || !data.hasOwnProperty('taskId') || !data.hasOwnProperty('results')){
    return res.end('{"result":"error","code": "3001","reason": "invalid params" }');
  }

  // step2. 解析 & 存储数据
  var resultCounts = 0,
      videoCounts = 0;
  var results = data.results;
  results.forEach(function(item){
    resultCounts += item.images.length;
    videoCounts += 1;
  });

  DVA_QueueLists.update({_id: data.taskId},{
    $set: {
      status: data.status,
      resultCounts: resultCounts,
      videoCounts: videoCounts,
      results: results
    }
  });

  return res.end('{"result":"success"}');

});

Meteor.startup(function() {
  Meteor.methods({
    'upsetDeepVideoDevices': function(obj) {
      if(!this.userId) {
        return false;
      }
      var action = obj.action;
      var service = obj.service;
      var macAddress = (service.txtRecord && service.txtRecord.macAddress) ? service.txtRecord.macAddress:'';
      if (!macAddress) {
        console.log('can not get deep video device mac address');
        return false;
      }

      var device = DVA_Devices.findOne({macAddress: macAddress});
      var ts = new Date();
      service.latestUpdateAt = ts;
      if( device ) { // device aleardy in db
        if (action == 'added') {
          service.status = 'online';
          DVA_Devices.update({
            _id: device._id
          }, {
            $set: service
          });
        } else {
          DVA_Devices.update({
            _id: device._id
          }, {
            $set: {
              latestUpdateAt: ts,
              status: 'offline'
            }
          });
        }
      }
      return true;
    }
  });
});