import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  process.env.MAIL_URL = 'smtp://postmaster%40tiegushi.com:a7e104e236965118d8f1bd3268f36d8c@smtp.mailgun.org:587'
  TEST_GROUP_ID = '0a3c12765104f7c9c827f6e5'

  sendGroupJobReport = function (group) {
    var html = SSR.render("srvemailTemplate");
    console.log("SEND MAIL", group._id, group.report_emails);
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
  
  sendJobReport = function (event) {
      try {
        var groups = SimpleChat.Groups.find({report_emails: {$exists: true}});
        groups.forEach(function(group) {
          var time_offset = 8;
          if (group._id && group.report_emails){//== TEST_GROUP_ID){
            console.log("EMAIS", group.report_emails);
            if (group && group.offsetTimeZone) {
              time_offset = group.offsetTimeZone;
            }
            CurrentGroupId = group._id
            
            now = new Date()
            localDate = LocalDateTimezone(now, time_offset);
            console.log("time:", localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 
              localDate.getHours(), localDate.getMinutes(), localDate.getSeconds())
              
            if(localDate.getHours() == 23){
                localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, group.offsetTimeZone)
                timeLists = TimelineLists.find({groupId:group._id, ZeroTimestamp:localZeroDateTimestamp}, {sort
  :{createdAt:1}}).fetch()
                if (timeLists.length > 0){
                  sendGroupJobReport(group);
                }
            }
          }
        });
      }
      catch(ex) {
        console.log("exception in sendJobReport", ex);
      }
    }
/*
    // 邮件发送
    SyncedCron.add({
      name: 'send report email 23:00 pm every day2',
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
*/    
});


