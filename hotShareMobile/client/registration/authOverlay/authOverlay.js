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
  };
  Template.webHome.helpers({
      resetPassword: function(t){
          if(Accounts._resetPasswordToken){
              Session.set('resetToken', Accounts._resetPasswordToken);
              Session.set('resetPassword', Accounts._resetPasswordToken);
          }
          return Session.get('resetPassword');
      }
  });
  Template.webHome.events({
      'submit #new-password':function(e,t){
          e.preventDefault();
          var newPass=t.find('#new-password-password').value;
          var repPass=t.find('#new-password-repeat').value;
          if(newPass!==repPass)
          {
            alert("两次填写的密码不一致");
            return;
          }
          if(newPass.length<6 || newPass.length>16)
          {
            alert("您输入的密码不符合规则");
            return;
          }
          Accounts.resetPassword(Session.get("resetToken"), newPass,function(error){
              if(error){
                  if(error.error===403 && error.reason==="Token expired")
                    alert("密码重设链接已经过期");
                  else
                    alert("暂时无法处理您的请求，请稍后重试！");
              }
              else{
                 alert("您的故事贴密码已重设成功");
              }
          });
      }
  });

  Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });
}

