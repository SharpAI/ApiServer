CurrentGroupId = null

Meteor.methods({
  sendEmail: function() {
    sendJobReport()
  },
  photos: function(){
    ret_timeLists = [] 
    deviceLists = DeviceTimeLine.find({"hour":new Date("2018-04-17T02:00:00.000Z"),"uuid":"28D6R17A18002042","group_id":"8dd8038be34d2f00035cc858"}).fetch()
    for (idx in deviceLists){
      //console.log(deviceLists[idx])
      var perMin = deviceLists[idx].perMin
        
      for (arr in perMin["7"]){
        console.log(perMin["7"][arr])
        var obj = {
          'time':perMin["7"][arr].ts,
          'img_url':perMin["7"][arr].img_url
        };
        ret_timeLists.push(obj)
      }
    }
    console.log(ret_timeLists)
    return ret_timeLists
  },
  person:function() {
    ret_timeLists = [] 
    group_id = CurrentGroupId
    persons = Person.find({group_id: '8dd8038be34d2f00035cc858'},{limit: 30, sort:{createAt: -1}}).fetch();
    for (i in persons){
      //console.log(persons[i])
      var obj = {
          'time': persons[i].name,
          'img_url':persons[i].url
        };
        ret_timeLists.push(obj)
    }
    return ret_timeLists
  }
});


