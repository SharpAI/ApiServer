import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

TEST_GROUP_ID = '29081bb21c3ac758db07f602' //'0a3c12765104f7c9c827f6e5'


Template.timeline.onCreated(function helloOnCreated() {

});

Template.timeline.helpers({
  timeLinelists() {
    var ret_timeLists = []
    
    group = SimpleChat.Groups.findOne({_id:TEST_GROUP_ID});
    
    if (group == null){
      return ret_timeLists
    }
    
    console.log("timeLinelists group", group)
    now = new Date()
    localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, group.offsetTimeZone)  
    console.log(localZeroDateTimestamp) 

    timeLists = TimelineLists.find({groupId:TEST_GROUP_ID, ZeroTimestamp:localZeroDateTimestamp}, {sort
:{createdAt:1}}).fetch()

    for (idx in timeLists) {
        //console.log(timeLists[idx], timeLists[idx]["createdAt"].getTime())
        
        timeLists[idx].personLists = []
        console.log(timeLists[idx]["faceId"])
        if (timeLists[idx]["faceId"] && timeLists[idx]["faceId"] != 'unknown'){
          var faceId = timeLists[idx]["faceId"].split(",");
          for (i in faceId){
            console.log(faceId[i])
            person = Person.findOne({faceId: faceId[i]})
            
            if (person){
              console.log(person)
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
    group_id = TEST_GROUP_ID
    console.log("timeLinelists group_id:", group_id)
    group = SimpleChat.Groups.findOne({_id:group_id});
    
    if (group == null){
      return ""
    }
    
    console.log("timeLinelists group", group)
    
    return group.name
  },
  person_name(){
    return 'Xing'
  }
});

