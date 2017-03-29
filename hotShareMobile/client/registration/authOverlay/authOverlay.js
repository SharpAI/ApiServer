if (Meteor.isClient) {
  window.ScanBarcodeByBarcodeScanner = function() {
    cordova.plugins.barcodeScanner.scan(
      function(result) {
        console.log("We got a barcode\n" +
          "Result: " + result.text + "\n" +
          "Format: " + result.format + "\n" +
          "Cancelled: " + result.cancelled);
        var gotoPage = '/';
        if (Session.get('channel') === 'chatGroups') {
          gotoPage = '/chatGroups';
        }
        if (result.text) {
          var followerId = result.text;
          if (followerId === Meteor.userId()) {
            Router.go(gotoPage);
            return;
          }
          var isFollowed = Follower.findOne({
            userId: Meteor.userId(),
            followerId: followerId
          });
          if (isFollowed) {
            Router.go(gotoPage);
            return;
          }
          var username = '';
          if (Meteor.user().profile.fullname){
            username = Meteor.user().profile.fullname;
          }
          else{
            username = Meteor.user().username;
          }

          Meteor.subscribe("usersById", followerId, {
            onReady: function() {
              var follower = Meteor.users.findOne({
                _id: followerId
              });
              if (follower) {
                var insertObj = {
                  userId: Meteor.userId(),
                  userName: username,
                  userIcon: Meteor.user().profile.icon,
                  userDesc: Meteor.user().profile.desc,
                  followerId: followerId,
                  followerName: follower.profile.fullname || follower.username,
                  followerIcon: follower.profile.icon,
                  followerDesc: follower.profile.desc,
                  createAt: new Date()
                };
                Follower.insert(insertObj);
                Router.go(gotoPage);
              } else {
                alert("扫描到的不是一个可用的用户");
                Router.go(gotoPage);
              }
            }
          });
        }
        if (result.cancelled) {
          Router.go(gotoPage);
          return;
        }
      },
      function(error) {
        alert("Scanning failed: " + error);
      }, {
        preferFrontCamera: false, // iOS and Android
        showFlipCameraButton: true, // iOS and Android
        showTorchButton: true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        prompt: "Place a barcode inside the scan area", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
        //disableAnimations: true, // iOS
        //disableSuccessBeep: false // iOS
      }
    );
  }
  Meteor.startup(function(){
      if (Accounts._resetPasswordToken) {
          Session.set('resetPassword', Accounts._resetPasswordToken);
      }
       WechatShare.isWXAppInstalled(function(result){
        Session.set('isWXAppInstalled', result);
      }, function(){});
  });
  Template.authOverlay.onRendered(function () {
    // StatusBar.backgroundColorByHexString("#ffffff");
    // StatusBar.styleDefault();
    $('body,.authOverlay').height($('body')[0].clientHeight);
    // $('.authOverlay').css('height', $(window).height());
    if (Meteor.user())
      Meteor.subscribe("follows");
    if (isUSVersion == true) {
      document.getElementById("authOverlaybg").style.backgroundImage = "url(loginbg1en.jpg)";
    } else {
    //   document.getElementById("authOverlaybg").style.backgroundImage = "url(loginbg1.png)";
      document.getElementById("authOverlaybg").style.backgroundImage = "url(theme_blue/loginbg1.jpg)";
    }  
  });
  // Template.authOverlay.onDestroyed(function () {
  //     StatusBar.backgroundColorByHexString("#37a7fe");
  //     StatusBar.styleLightContent();
  // });
  Template.authOverlay.helpers({
      isLoggingIn:function() {
          return Meteor.loggingIn();
      },
      isWXAppInstalled:function(){
          if(device.platform === 'iOS'){
              return Session.get('isWXAppInstalled');
          }
          return true;
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
                    checkShareUrl();
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
                    //Router.go('/registerFollow');
                    ScanBarcodeByBarcodeScanner();
                } else {
                    $('.agreeDeal').css('display',"none");
                    PUB.toast ('匿名服务暂时不可用，请稍后重试');
                }
            });
    },
    'click #register': function () {
        PUB.page('/signupForm');
    //   $('.register').css('display',"block")
    //   $('#register').css('display',"none")
    //   $('#weibo').css('display',"none")
    //   $('#login').css('display',"none")
    //   $('.recovery').css('display',"none")
    //   $('.agreeDeal').css('display',"none");
      Session.set("dealBack","register");
//      $('.authOverlay').css('-webkit-filter',"blur(10px)")
    },
    'click #login': function () {
        PUB.page('/loginForm');
    //   $('.login').css('display',"block")
    //   $('#register').css('display',"none")
    //   $('#weibo').css('display',"none")
    //   $('#login').css('display',"none")
    //   $('.recovery').css('display',"none")
    //   $('.agreeDeal').css('display',"none");
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
    'click #wechat': function (e,t) {
      if (Meteor.status().connected !== true) {
        PUB.toast('当前为离线状态,请检查网络连接');
        return;
      }
      Meteor.loginWithWeixin(function(err, result) {
        if (err) {
          PUB.toast('微信登陆失败');
          return console.log(err);
        } else {
          if(Meteor.user().profile.new === undefined || Meteor.user().profile.new === true)
          {
              Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.new": true}});
                //return Router.go('/registerFollow');
                ScanBarcodeByBarcodeScanner();
          }
          else
            return Router.go('/');
        }
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

