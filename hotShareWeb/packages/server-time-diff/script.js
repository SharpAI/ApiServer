if (Meteor.isClient){
  Meteor._serverTimeDiff = (1*localStorage.getItem('METEOR_SERVER_TIME_DIFF')) || 0;
  Meteor.getServerNow = function(){
    return new Date(Date.now() + Meteor._serverTimeDiff);
  };

  Meteor.startup(function() {
    Meteor.call('MeteorGetServerTime', function(error, result) {
      if (!error){
        Meteor._serverTimeDiff = result - Date.now();
        localStorage.setItem('METEOR_SERVER_TIME_DIFF', Meteor._serverTimeDiff);
      }
    });
  });
} else {
  Meteor.methods({
    'MeteorGetServerTime': function() {
      return Date.now();
    }
  });
}