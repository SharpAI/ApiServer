Meteor.methods({
  sendHtmlEmail: function (to, from, subject, html) {
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