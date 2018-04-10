import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  process.env.MAIL_URL = 'smtp://postmaster%40tiegushi.com:a7e104e236965118d8f1bd3268f36d8c@smtp.mailgun.org:587'
  
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
  
  sendGroupJobReport = function (group) {
    var html = SSR.render("srvemailTemplate");
    console.log(group._id, group.report_emails);
    //console.log(html)
    to = group.report_emails
    var from = 'DeepEye<notify@mail.tiegushi.com>';
    var subject = 'DeepEye Daily Report';
    
    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: html
    });
  }
  
  function sendJobReport() {
      try {
        var groups = SimpleChat.Groups.find({report_emails: {$exists: true}});
        groups.forEach(function(group) {
          var time_offset = 8;
          if (group._id == '0a3c12765104f7c9c827f6e5'){
            
            if (group && group.offsetTimeZone) {
              time_offset = group.offsetTimeZone;
            }
            CurrentGroupId = group._id
            
            now = new Date()
            localDate = LocalDateTimezone(now, time_offset);
            console.log("send email out", localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 
              localDate.getHours(), localDate.getMinutes(), localDate.getSeconds())
              
            if(localDate.getHours() == 23){
              sendGroupJobReport(group);
            }
          }
        });
      }
      catch(ex) {
        console.log("exception in sendJobReport", ex);
      }
    }

    // 邮件发送
    SyncedCron.add({
      name: 'send report email 12:00 am every day',
      schedule: function(parser){
        // parser is later.parse pbject
        // UTC -7 的12：00 am 也就是 UTC 8 下一天的 03:00 am 
        // 每小时执行一次
        return parser.text('every 1 hour');
      },
      job: function(){
        sendJobReport();
        return 1;
      }
    });

    SyncedCron.start();
  
});


