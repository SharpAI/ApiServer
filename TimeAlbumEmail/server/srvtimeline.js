
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

SSR.compileTemplate('srvtimeline', Assets.getText('srvtimeline.html'));

Template.srvtimeline.onCreated(function helloOnCreated() {

});

Template.srvtimeline.helpers({

  timeLinelists() {
    group_id = CurrentGroupId
    console.log("group_id:", group_id)
    
    group = SimpleChat.Groups.findOne({_id:group_id});
    console.log("group", group)
    
    now = new Date()
    localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, group.offsetTimeZone)
    console.log(localZeroDateTimestamp)
    
    var ret_timeLists = []
    
    timeLists = TimelineLists.find({ZeroTimestamp:localZeroDateTimestamp}, {sort
:{createdAt:1}}).fetch()
    for (idx in timeLists) {
        //console.log(timeLists[idx], timeLists[idx]["createdAt"].getTime())
        if (timeLists[idx]["createdAt"].getTime() < 1523296886840){
            continue
        }
        
        ret_timeLists.push(timeLists[idx])
    }
    return ret_timeLists
  }
});

