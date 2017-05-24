if (Meteor.isClient) {
  var serverTimeDiff = (1 * localStorage.getItem('SERVER_TIME_DIFF')) || 0;
  GetServerDate = function () {
    return new Date(Date.now() + serverTimeDiff);
  };

  Meteor.startup(function () {
    Meteor.call('get-server-date', function (error, result) {
      if (!error) {
        serverTimeDiff = result - Date.now();
        localStorage.setItem('SERVER_TIME_DIFF', serverTimeDiff);
      }
    });
  });
} else {
  Meteor.methods({
    'get-server-date': function () {
      return Date.now();
    }
  });
}