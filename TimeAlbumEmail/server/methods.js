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

Meteor.methods({
  sendHtmlEmail: function (to,  html) {
    
    var gloup_id = '0a3c12765104f7c9c827f6e5'
    now = new Date()
    localDate = LocalDateTimezone(now, -7);
    
    year = localDate.getFullYear() 
    month = localDate.getMonth()
    day = localDate.getDate()
    hour = localDate.getHours()
    console.log(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 
    localDate.getHours(), localDate.getMinutes(), localDate.getSeconds())
    
    key = gloup_id +"--" + year + "-" + month + "-" + day
    console.log("key:", key)
    
    if (hour != 23){
      console.log("only 23:00 can send email, return ", hour)
     // return;
    }
    
    if (AlreadySend[key] == true){
      console.log("already send, return")
      //return;
    }
    
    AlreadySend[key] =  true

    var group = SimpleChat.Groups.findOne({_id: gloup_id});
    console.log(group._id, group.report_emails);
    
    
    to = group.report_emails
    var from = '<notify@mail.tiegushi.com>';
    var subject = 'DeepEye Daily Report';
    
    this.unblock();
    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: html
    });
  }
});