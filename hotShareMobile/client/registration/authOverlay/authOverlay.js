if (Meteor.isClient) {
  Meteor.startup(function(){
      if (Accounts._resetPasswordToken) {
          Session.set('resetPassword', Accounts._resetPasswordToken);
      }
  });
  Template.authOverlay.rendered = function() {
      $('.authOverlay').css('height', $(window).height());
      if(Meteor.user())
        Meteor.subscribe("follows");
    };
  Template.authOverlay.helpers({
      isLoggingIn:function() {
          return Meteor.loggingIn();
      }
  });
  Template.authOverlay.events({
    'click #anonymous': function () {
        console.log ('UUID is ' + device.uuid);
        if (device.uuid){
            Meteor.loginWithPassword(device.uuid,'123456',function(error){
                console.log('Login Error is ' + JSON.stringify(error));
                if(error && error.reason && error.reason ==='User not found'){
                    console.log('User Not Found, need create');
                    $('.agreeDeal').css('display',"block");
                    Session.set("dealBack","anonymous");
                }
                if (!error){
                    Router.go ('/');
                }
            });
        } else {
            PUB.toast ('您的设备不支持匿名使用，请和我们联系');
        }
    },
    'click #cancle': function () {
      $('.agreeDeal').css('display',"none");
    },
    'click #agree': function () {
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
                    console.log('Registration Succ, goto Follow page');
                    Router.go('/registerFollow');
                } else {
                    $('.agreeDeal').css('display',"none");
                    PUB.toast ('匿名服务暂时不可用，请稍后重试');
                }
            });
    },
    'click #register': function () {
//      Router.go('/signupForm');
      $('.register').css('display',"block")
      $('#register').css('display',"none")
      $('#weibo').css('display',"none")
      $('#login').css('display',"none")
      $('.recovery').css('display',"none")
      $('.agreeDeal').css('display',"none");
      Session.set("dealBack","register");
//      $('.authOverlay').css('-webkit-filter',"blur(10px)")
    },
    'click #login': function () {
//      Router.go('/loginForm');
      $('.login').css('display',"block")
      $('#register').css('display',"none")
      $('#weibo').css('display',"none")
      $('#login').css('display',"none")
      $('.recovery').css('display',"none")
      $('.agreeDeal').css('display',"none");
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
    Session.set("resetPasswordSuccess", false);
  };
  Template.webHome.helpers({
      resetPassword: function(){
          return Session.get('resetPassword');
      },
      pwdErrorInfo: function(){
          return Session.get("pwdErrorInfo");
      },
      resetPasswordSuccess: function(){
          return Session.get("resetPasswordSuccess");
      }
  });
  Template.webHome.events({
      'submit #new-password':function(e,t){
          e.preventDefault();
          var newPass=t.find('#new-password-password').value;
          var repPass=t.find('#new-password-repeat').value;
          if(newPass!==repPass)
          {
            Session.set("pwdErrorInfo", "两次填写的密码不一致");
            $('.errorInfo').show();
            Meteor.setTimeout(function(){
                $('.errorInfo').hide();
            },3000);
            return false;
          }
          if(newPass.length<6 || newPass.length>16)
          {
            Session.set("pwdErrorInfo", "您输入的密码不符合规则");
             $('.errorInfo').show();
            Meteor.setTimeout(function(){
                $('.errorInfo').hide();
            },3000);
            return false;
          }
          Accounts.resetPassword(Session.get("resetPassword"), newPass,function(error){
              if(error){
                  if(error.error===403 && error.reason==="Token expired"){
                    Session.set("pwdErrorInfo", "密码重设链接已经过期，请从手机端再次发起重设请求");
                     $('.errorInfo').show();
                      Meteor.setTimeout(function(){
                          $('.errorInfo').hide();
                      },3000);}
                  else{
                    Session.set("pwdErrorInfo", "未能成功重设密码，请稍后重试或从手机端再次发起重设请求");
                     $('.errorInfo').show();
                      Meteor.setTimeout(function(){
                          $('.errorInfo').hide();
                      },3000);
                    }
              }
              else{
                 Session.set("resetPasswordSuccess", true);
              }
          });
          return false;
      },
      'click #finishReset' :function(){
           Session.set('resetPassword', false);
       }
  });

  Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });
}

