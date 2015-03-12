if (Meteor.isClient) {
  Template.authOverlay.rendered = function() {
      $('.authOverlay').css('height', $(window).height());
    };
  Template.authOverlay.helpers({
      isLoggingIn:function() {
          return Meteor.loggingIn();
      }
  });
  Template.authOverlay.events({
    'click #anonymous': function () {
      $('.agreeDeal').css('display',"block")
    },
    'click #cancle': function () {
      $('.agreeDeal').css('display',"none")
    },
    'click #agree': function () {
      console.log ('UUID is ' + device.uuid);
      if (device.uuid){
          Meteor.loginWithPassword(device.uuid,'123456',function(error){
              console.log('Login Error is ' + JSON.stringify(error));
              if(error && error.reason && error.reason ==='User not found'){
                  console.log('User Not Found, need create');
                  Accounts.createUser({
                      'username':device.uuid,
                      'password':'123456',
                      'profile':{
                          fullname:'匿名',
                          icon:'/userPicture.png',
                          anonymous:true
                          }
                      },
                      function(error){
                          console.log('Registration Error is ' + JSON.stringify(error));
                          if (!error){
                              'Registration Succ, goto Follow page'
                              Router.go('/registerFollow');
                          }
                      });
              }
              if (!error){
                Router.go ('/');
              }
          });
      } else {
          PUB.toast ('您的设备不支持匿名使用，请和我们联系');
      }

    },
    'click #register': function () {
//      Router.go('/signupForm');
      $('.register').css('display',"block")
      $('#register').css('display',"none")
      $('#weibo').css('display',"none")
      $('#login').css('display',"none")
//      $('.authOverlay').css('-webkit-filter',"blur(10px)")
    },
    'click #login': function () {
//      Router.go('/loginForm');
      $('.login').css('display',"block")
      $('#register').css('display',"none")
      $('#weibo').css('display',"none")
      $('#login').css('display',"none")
//      $('.authOverlay').css('-webkit-filter',"blur(10px)")
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
      Meteor.loginWithQq({
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
    $('.webFooter').css('left', $(window).width()*0.5-105);
  };
  Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });
}

