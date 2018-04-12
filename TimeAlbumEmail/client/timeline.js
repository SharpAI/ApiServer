import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

TEST_GROUP_ID = 'd6d6db0aa8fac4b44e672c96'

function LocalZeroTimezoneTimestamp(d, time_offset) {
    if (time_offset == undefined){
        if (d.getTimezoneOffset() == 420){
            time_offset = -7
        }else {
            time_offset = 8
        }
    }
    // 取得 UTC time
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var local_now = new Date(utc + (3600000*time_offset))
    
    var today_zero = new Date(Date.UTC(local_now.getFullYear(), local_now.getMonth(), local_now.getDate()));
            
    return today_zero.getTime();
}


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
        console.log(timeLists[idx], timeLists[idx]["createdAt"].getTime())
        ret_timeLists.push(timeLists[idx])
    }
    
    return ret_timeLists
  }
});

