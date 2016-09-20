this.confirmReporterAuth = function(userId) {
  var user;
  console.log(userId);
  user = Meteor.users.findOne({
    _id: userId
  });
  return user.profile.reporterSystemAuth;
};