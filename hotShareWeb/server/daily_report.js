if(Meteor.isServer){
  Meteor.startup(function(){
    String.prototype.replaceAll = function(s1,s2) {
      return this.replace(new RegExp(s1,"gm"),s2);
    };

    function calcTimeStamp23() {
      var now = new Date();
      var millisTill23 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0) - now;
      if (millisTill23 < 0) {
        millisTill23 += 86400000; // it's after 10am, try 10am tomorrow.
      }
      console.log('millisTill23:', millisTill23);
      return millisTill23;
    }

    function sendGroupJobReport(group, emails) {
      var group_id = group._id;
      var now = new Date();
      var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate(), 0, 0, 0, 0);

      var job_report = Assets.getText('email/job-report.html');
      job_report = job_report.replaceAll('{{company_name}}', group.name);
      job_report = job_report.replaceAll('{{job_date}}', now.toISOString().split('T')[0]);

      var subject = "每日考勤报告";
      var to = group.report_emails;
      if (emails){
        to = emails;
      }

      var job_content = '';

      var workStatus = WorkStatus.find({group_id: group_id, date: date});
      if (workStatus) {
        workStatus.forEach(function(ws) {
          var pContent = Assets.getText('email/job-item.html');
          var strInTime = '';
          var strOutTime = '';
          pContent = pContent.replaceAll('{{person_name}}', ws.person_name);
          if (ws.in_time != 0) {
            strInTime = new Date(ws.in_time).toLocaleString();
            strInTime = strInTime.substring(strInTime.indexOf(' ') + 1);
          }
          if (ws.out_time != 0) {
            strOutTime = new Date(ws.out_time).toLocaleString();
            strOutTime = strOutTime.substring(strOutTime.indexOf(' ') + 1);
          }
          pContent = pContent.replaceAll('{{person_in_time}}', strInTime);
          pContent = pContent.replace('{{person_in_image}}', ws.in_image);
          pContent = pContent.replaceAll('{{person_out_time}}', strOutTime);
          pContent = pContent.replace('{{person_out_image}}', ws.out_image);
          var summary = ws.whats_up;
          if (!summary)
            summary = '工作总结还没有填写!';
          pContent = pContent.replace('{{person_summary}}', summary);

          job_content += pContent;
        });
      }

      job_report = job_report.replace('{{job_content}}', job_content)

      try {
          Email.send({
              to: to,
              from: '故事贴<notify@mail.tiegushi.com>',
              subject: subject,
              html: job_report,
              envelope: {
                  from: "故事贴<notify@mail.tiegushi.com>",
                  to: to + "<" + to + ">"
              }
          });

          // console.log('send mail to:', notifyUser.userEmail);
      } catch (_error) {
        ex = _error;
        //console.log("err is: ", ex);
        console.log("Exception: sendEmail: error=%s, to=%s", ex, to);
      }
    }

    function delay3HourThenScheduleAgain() {
      console.log('delay3HourThenScheduleAgain');
      Meteor.setTimeout(sendJobReport, calcTimeStamp23());
    }

    function sendJobReport(time_offset) {
      console.log('sendJobReport, current timeOffsetZone is '+time_offset);

      try {
        var groups = SimpleChat.Groups.find({report_emails: {$exists: true}});
        groups.forEach(function(group) {
          console.log(group._id, group.report_emails);
          group_time_offset = group.offsetTimeZone ? group.offsetTimeZone : 8;
          if(group_time_offset == time_offset){
            sendGroupJobReport(group);
          }
        });
      }
      catch(ex) {
        console.log("exception in sendJobReport", ex);
      }

      //Meteor.setTimeout(delay3HourThenScheduleAgain, 3*60*60*1000);
    }

    //Meteor.setTimeout(sendJobReport, calcTimeStamp23());
    // 国内邮件发送
    SyncedCron.add({
      name: 'send report email 10:00 pm every day(UTC 8)',
      schedule: function(parser){
        // parser is later.parse pbject
        return parser.text('at 14:00 pm');
      },
      job: function(){
        sendJobReport(8);
        return 1;
      }
    });

    // 美国邮件发送
    SyncedCron.add({
      name: 'send report email at 10:00 pm every day(UTC -7)',
      schedule: function(parser) {
        return parser.text('at 05:00 am');
      },
      job: function(){
        sendJobReport(-7);
        return 1;
      }
    });

    SyncedCron.start();

    Meteor.methods({
      // for local test method 
      'testGroupDailyReport': function (group_id, emails) {
        var group = SimpleChat.Groups.findOne({_id: group_id});
        console.log(group._id, emails);
        console.log(group._id, group.report_emails);
        sendGroupJobReport(group, emails);
      }
    });
  });
}
