/**
 * Created by simba on 6/3/15.
 */

if (Meteor.isClient) {
  Meteor.startup(function(){
      if (Accounts._resetPasswordToken) {
          Session.set('resetPassword', Accounts._resetPasswordToken);
      }
  });

  Template.ResetPassword.helpers({
      pwdErrorInfo: function(){
          return Session.get("pwdErrorInfo");
      },
      resetPasswordSuccess: function(){
          return Session.get("resetPasswordSuccess");
      }
  });
  Template.ResetPassword.events({
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
}
