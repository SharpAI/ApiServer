if (Meteor.isClient) {
  Template.authOverlay.rendered = function() {
      $('.authOverlay').css('height', $(window).height());
    };
  Template.authOverlay.events({
    'click #register': function () {
//      Router.go('/signupForm');
      $('.register').css('display',"block")
      $('.authOverlay').css('-webkit-filter',"blur(10px)")
    },
    'click #login': function () {
//      Router.go('/loginForm');
      $('.login').css('display',"block")
      $('.authOverlay').css('-webkit-filter',"blur(10px)")
    },
    'click #weibo': function () {
      Meteor.loginWithWeibo({
        loginStyle: 'popup'
        //loginStyle: 'redirect'
        //loginStyle: 'redirect'  you can use redirect for mobile web app
      }, function () {
        console.log('in call back', arguments);
      });
    },
    'click #wechat': function () {
      Meteor.loginWithWechat({
        loginStyle: 'popup'
        //loginStyle: 'redirect'
        //loginStyle: 'redirect'  you can use redirect for mobile web app
      }, function () {
        console.log('in call back', arguments);
      });
    },
    'click #qq': function () {
      Meteor.loginWithQQ({
        loginStyle: 'popup'
        //loginStyle: 'redirect'
        //loginStyle: 'redirect'  you can use redirect for mobile web app
      }, function () {
        console.log('in call back', arguments);
      });
    }

  });
  Template.webHome.rendered = function() {
    $('.webHome').css('height', $(window).height());
  };
}

