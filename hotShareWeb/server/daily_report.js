if(Meteor.isServer){
  Meteor.startup(function(){
    function calcTimeStamp23() {
      var now = new Date();
      var millisTill23 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0) - now;
      if (millisTill23 < 0) {
        millisTill23 += 86400000; // it's after 10am, try 10am tomorrow.
      }
      console.log('millisTill23:', millisTill23);
      return millisTill23;
    }

    function sendGroupJobReport(group) {
      var group_id = group._id;
      var now = new Date();
      var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate(), 0, 0, 0, 0);

      var job_report = Assets.getText('email/job-report.html');
      job_report = job_report.replace('{{company_name}}', group.name);
      job_report = job_report.replace('{{job_date}}', now.toISOString().split('T')[0]);

      var subject = "每日考勤报告";
      var to = group.report_emails;

      var job_content = '';

      var workStatus = WorkStatus.find({group_id: group_id, date: date});
      if (workStatus) {
        workStatus.forEach(function(ws) {
          var pContent = Assets.getText('email/job-item.html');
          pContent = pContent.replace('{{person_name}}', ws.person_name);
          pContent = pContent.replace('{{person_in_time}}', new Date(ws.in_time).toLocaleString().substr(11, 8));
          pContent = pContent.replace('{{person_in_image}}', ws.in_image);
          pContent = pContent.replace('{{person_out_time}}', new Date(ws.out_time).toLocaleString().substr(11, 8));
          pContent = pContent.replace('{{person_out_image}}', ws.out_image);
          var summary = ws.whats_up;
          if (!summary)
            summary = '工作总结还没有填写!';
          pContent = pContent.replace('{{person_summary}}', summary);

          job_content += pContent;
        });
      }

      job_report = job_report.replace('{{job_content}}', job_content);

      console.log(job_report);

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

    function sendJobReport() {
      console.log('sendJobReport');

      try {
        var groups = SimpleChat.Groups.find({report_emails: {$exists: true}});
        groups.forEach(function(group) {
          console.log(group._id, group.report_emails);
          sendGroupJobReport(group);
        });
      }
      catch(ex) {
        console.log("exception in sendJobReport", ex);
      }

      Meteor.setTimeout(delay3HourThenScheduleAgain, 3*60*60*1000);
    }

    Meteor.setTimeout(sendJobReport, calcTimeStamp23());
  });
}
