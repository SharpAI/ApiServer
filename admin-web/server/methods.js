Meteor.methods({
  sendHtmlEmail: function (to,  html) {
    var from = 'admin@hotshare.com';
    var subject = '故事贴每周精选故事';
    check([to, from, subject, html], [String]);
    this.unblock();
    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: html
    });
  }
});