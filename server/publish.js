Meteor.publish('enrolledUser', function (token) {
    return Meteor.users.find({"services.password.reset.token": token});
});