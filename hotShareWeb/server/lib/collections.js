Meteor.startup(function(){
    Accounts.onCreateUser(function(options, user) {
      var randomI = parseInt(Math.random()*33+1);
      if (options.profile)
      {
        user.profile = options.profile;
        if(user.profile.anonymous === true)
          user.profile.icon = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + randomI + '.png';
        if(user.profile.name)
          user.profile.fullname = user.profile.name;
      }
      return user;
    });
});
