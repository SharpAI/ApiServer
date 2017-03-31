if (Meteor.isClient) {
  Meteor.startup(function(){
      if (Accounts._resetPasswordToken) {
          Session.set('resetPassword', Accounts._resetPasswordToken);
      }
  });
  Template.authOverlay.onRendered(function () {
    // StatusBar.backgroundColorByHexString("#ffffff");
    // StatusBar.styleDefault();
    $('body,.authOverlay').height($('body')[0].clientHeight);
    // $('.authOverlay').css('height', $(window).height());
    if (Meteor.user())
      Meteor.subscribe("follows");
    document.getElementById("authOverlaybg").style.backgroundImage = "url(theme_blue/loginbg1.jpg)";
  });

  Template.authOverlay.helpers({
      isLoggingIn:function() {
          return Meteor.loggingIn();
      },
  });
  Template.authOverlay.events({
    'click #register': function () {
        PUB.page('/signupForm');
        Session.set("dealBack","register");
    },
    'click #login': function () {
        PUB.page('/loginForm');
    },

  });
}

