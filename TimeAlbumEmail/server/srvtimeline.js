SSR.compileTemplate('srvtimeline', Assets.getText('srvtimeline.html'));

Template.srvtimeline.onCreated(function helloOnCreated() {
});

Template.srvtimeline.helpers({
  timeLinelists() {
    var ret_timeLists = []
    
    group_id = CurrentGroupId
    group = SimpleChat.Groups.findOne({_id:group_id});

    if (group == null){
      return ret_timeLists
    }
    
    now = new Date()
    localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, group.offsetTimeZone)
    
    //console.log("timeLinelists group_id:", group_id)
    //console.log("timeLinelists group", group)
    //console.log("localZeroDateTimestamp", localZeroDateTimestamp)

    timeLists = TimelineLists.find({groupId:group_id, ZeroTimestamp:localZeroDateTimestamp}, {sort
:{createdAt:1}}).fetch()

    for (idx in timeLists) {
      //console.log(timeLists[idx], timeLists[idx]["createdAt"].getTime())
      
      timeLists[idx].personLists = []
      //console.log(timeLists[idx]["faceId"])
      if (timeLists[idx]["faceId"] && timeLists[idx]["faceId"] != 'unknown'){
        var faceId = timeLists[idx]["faceId"].split(",");
        for (i in faceId){
          //console.log(faceId[i])
          person = Person.findOne({faceId: faceId[i]})
          
          if (person){
            //console.log(person)
            var obj = {
              'name': person.name,
              'name_img_url':person.url
            };
            timeLists[idx].personLists.push(obj)
          }
        }
      }
      ret_timeLists.push(timeLists[idx])
    }
    
    return ret_timeLists

  },
  company_name() {
    group_id = CurrentGroupId
    group = SimpleChat.Groups.findOne({_id:group_id});
    
    return group.name
  }
});

