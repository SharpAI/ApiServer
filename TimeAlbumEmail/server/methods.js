function LocalDateTimezone(d, time_offset) {
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
    var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
    local_now.getHours(), local_now.getMinutes(), local_now.getSeconds());

    return today_now;
}
var AlreadySend ={};
CurrentGroupId = null

Meteor.methods({
  sendEmail: function() {
    var gloup_id = '0a3c12765104f7c9c827f6e5'
    var group = SimpleChat.Groups.findOne({_id: gloup_id});
    this.unblock();
    
    CurrentGroupId = gloup_id
    
    sendGroupJobReport(group)
  }
});



