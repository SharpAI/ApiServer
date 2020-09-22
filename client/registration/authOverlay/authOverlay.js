if (Meteor.isClient) {
  window.ScanBarcodeByBarcodeScanner = function() {
    cordova.plugins.barcodeScanner.scan(
      function(result) {
        console.log("We got a barcode\n" +
          "Result: " + result.text + "\n" +
          "Format: " + result.format + "\n" +
          "Cancelled: " + result.cancelled);
        var gotoPage = '/';
        //var  requiredStr = rest_api_url+'/simple-chat/to/group?id=' 
        if (result.text) {
          if (Session.get('addHomeAIBox') === true) {
            Router.go('/scanFailPrompt');
            Session.set('addHomeAIBox',false);
            return;
          }
          //if (result.text.indexOf(requiredStr)=== 0) {
          if (result.text.indexOf('http://workaicdn.tiegushi.com/simple-chat/to/group?id=') >= 0 || result.text.indexOf('http://testworkai.tiegushi.com/simple-chat/to/group?id=') >= 0){
            //var groupid = result.text.substring(requiredStr.length);
            var groupid = result.text.substr(result.text.lastIndexOf('?id=')+'?id='.length);
            console.log('groupid==='+groupid);
            if (groupid && groupid.length > 0) {
              Meteor.call('add-group-urser', groupid, [Meteor.userId()], function(err, result) {
                if (err) {
                  console.log(err);
                  return PUB.toast('添加失败，请重试~');
                }
                if (result === 'succ') {
                   PUB.toast('添加成功');
                   gotoPage = '/simple-chat/to/group?id='+ groupid;
                   Meteor.subscribe('get-group',groupid, {
                      onReady: function() {
                        var group, msgObj, user;
                        group = SimpleChat.Groups.findOne({
                          _id: groupid
                        });
                        var msgSession = SimpleChat.MsgSession.findOne({userId: Meteor.userId(), toUserId: group._id});
                        if (msgSession) {
                          return;
                        }
                        user = Meteor.user();
                        msgObj = {
                          toUserId: group._id,
                          toUserName: group.name,
                          toUserNames: group.name,
                          toUserIcon: group.icon,
                          sessionType: 'group',
                          userId: user._id,
                          userName: user.profile.fullname || user.username,
                          userIcon: user.profile.icon || '/userPicture.png',
                          lastText: '',
                          createAt: new Date(),
                          updateAt: new Date(),
                        };
                        return SimpleChat.MsgSession.insert(msgObj);
                      }
                    });
                   var relations = WorkAIUserRelations.findOne({'app_user_id':Meteor.userId()});
                   if (!relations) {
                      // Meteor.setTimeout(function(){
                      return Router.go('/timeline');
                      // },500);
                    }
                   return Router.go(gotoPage);
                }
                if (result === 'not find group') {
                  PUB.toast('二维码格式错误或该群组已被删除');
                  return Router.go(gotoPage);
                }
              });
            }
            else{
              Router.go(gotoPage);
              PUB.toast('二维码格式错误或该群组已被删除')
            }

          }
          else{
            Router.go(gotoPage);
            PUB.toast('你可能扫描了错误的二维码，请检查......')
          }
        }
        if (result.cancelled) {
          Router.go(gotoPage);
          return;
        }
        if (result.alumTapped) {
          DecodeImageFromAlum();
          return;
        }
      },
      function(error) {
        alert("Scanning failed: " + error);
      }, {
        preferFrontCamera: false, // iOS and Android
        showFlipCameraButton: true, // iOS and Android
        showTorchButton: true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        prompt: "Place a barcode inside the scan area", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
        //disableAnimations: true, // iOS
        //disableSuccessBeep: false // iOS
      }
    );
  }
  window.DecodeImageFromAlum = function(){
    function decodecallback(result){
      var gotoPage = '/';
      if (result && (result.indexOf('http://workaicdn.tiegushi.com/simple-chat/to/group?id=') >= 0 || result.indexOf('http://testworkai.tiegushi.com/simple-chat/to/group?id=') >= 0)){
        var groupid = result.substr(result.lastIndexOf('?id=')+'?id='.length);
        console.log('groupid==='+groupid);
        if (groupid && groupid.length > 0) {
          Meteor.call('add-group-urser', groupid, [Meteor.userId()], function(err, result) {
            if (err) {
              console.log(err);
              return PUB.toast('添加失败，请重试~');
            }
            if (result === 'succ') {
               PUB.toast('添加成功');
               gotoPage = '/simple-chat/to/group?id='+ groupid;
               Meteor.subscribe('get-group',groupid, {
                  onReady: function() {
                    var group, msgObj, user;
                    group = SimpleChat.Groups.findOne({
                      _id: groupid
                    });
                    if (group) {
                      var msgSession = SimpleChat.MsgSession.findOne({userId: Meteor.userId(), toUserId: group._id});
                      if (msgSession) {
                        return;
                      }
                      user = Meteor.user();
                      msgObj = {
                        toUserId: group._id,
                        toUserName: group.name,
                        toUserIcon: group.icon,
                        sessionType: 'group',
                        userId: user._id,
                        userName: user.profile.fullname || user.username,
                        userIcon: user.profile.icon || '/userPicture.png',
                        lastText: '',
                        createAt: new Date(),
                        updateAt: new Date(),
                      };
                      SimpleChat.MsgSession.insert(msgObj);
                    }
                  }
                });
               return Router.go(gotoPage);
            }
            if (result === 'not find group') {
              PUB.toast('二维码格式错误或该群组已被删除');
              return Router.go(gotoPage);
            }
          });
        }
        else{
          Router.go(gotoPage);
          PUB.toast('二维码格式错误或该群组已被删除')
        }
      }
      else{
        Router.go(gotoPage);
        PUB.toast('你可能扫描了错误的二维码，请检查......')
      }
    }
    if(device.platform === 'Android' ){
      pictureSource = navigator.camera.PictureSourceType;
      destinationType = navigator.camera.DestinationType;
      encodingType = navigator.camera.EncodingType;

      navigator.camera.getPicture(function(s){
        console.log('##RDBG pic get: ' + s);

        localFile = s.substring(7);
        console.log('##RDBG local file: ' + localFile);
        questionMark = localFile.indexOf('?');
        if (questionMark > 0) {
          localFile = localFile.substring(0, questionMark);
          console.log('##RDBG local file: ' + localFile);
        }

        cordova.plugins.barcodeScanner.decodeImage(localFile, function (result) {
          console.log("##RDBG decodeImage suc: " + result);
          decodecallback(result);
        }, function (err) {
          console.log('##RDBG decodeImage err: ' + err);
        });
      }, function(err) {
        console.log('##RDBG pic get fail: ' + err);
      }, {
        quality: 20,
        targetWidth: 1900,
        targetHeight: 1900,
        destinationType: destinationType.FILE_URI,
        sourceType: pictureSource.SAVEDPHOTOALBUM
      });
    }
    else {
      window.imagePicker.getPictures(function (results) {
        for (var i = 0; i < results.length; i++) {
          localFile = results[i].substring(7);
          console.log('##RDBG local file: ' + localFile);

          cordova.plugins.barcodeScanner.decodeImage(localFile, function (result) {
            console.log("##RDBG decodeImage suc: " + result);
            decodecallback(result);
          }, function (err) {
            console.log('##RDBG decodeImage err: ' + err);
            PUB.toast('二维码格式错误或该群组已被删除');
          });
        }
      }, function (error) {
        console.log('getPictures Error: ' + error);
      }, {
          maximumImagesCount: 1
        });
    }
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
      // document.getElementById("authOverlaybg").style.backgroundImage = "url(loginbg1en.jpg)";
    } else {
    //   document.getElementById("authOverlaybg").style.backgroundImage = "url(loginbg1.png)";
      // document.getElementById("authOverlaybg").style.backgroundImage = "url(theme_blue/loginbg1.jpg)";
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
                    var flag = window.localStorage.getItem("isSecondUse") === 'true';
                    if (flag) {
                      Router.go('/');
                    }
                    else{
                      Router.go('/introductoryPage');
                    }

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
    'click #wechatBtn': function (e,t) {
      if (Meteor.status().connected !== true) {
        PUB.toast('当前为离线状态,请检查网络连接');
        return;
      }
      if(device.platform === 'iOS' && !Session.get('isWXAppInstalled')){
        PUB.toast('当前没有安装微信');
        return;
      }
      Meteor.loginWithWeixin(function(err, result) {
        if (err) {
          PUB.toast('微信登陆失败');
          return console.log(err);
        } else {
          PUB.toast('微信登陆成功');
          if(Meteor.user().profile.new === undefined || Meteor.user().profile.new === true)
          {
              Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.new": false}});
                //return Router.go('/registerFollow');
                // ScanBarcodeByBarcodeScanner();
                var flag = window.localStorage.getItem("isSecondUse") === 'true';
                if (flag) {
                  Router.go('/');
                }
                else{
                  Router.go('/introductoryPage');
                }
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
