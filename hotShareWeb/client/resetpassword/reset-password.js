/**
 * Created by simba on 6/3/15.
 */

if (Meteor.isClient) {
    Meteor.startup(function(){
        if (Accounts._resetPasswordToken) {
            Session.set('resetPassword', Accounts._resetPasswordToken);
        }
    });
    var areValidPasswords = function(password,passwordConfirm){
        if(password !== passwordConfirm){
            alert("两次输入的密码不一致");
            return false;
        }
        return true;
    };
    Template.ResetPassword.events({
        'submit #resetPasswordForm': function (e, t) {
            e.preventDefault();

            var resetPasswordForm = $(e.currentTarget),
                password = resetPasswordForm.find('#resetPasswordPassword').val(),
                passwordConfirm = resetPasswordForm.find('#resetPasswordPasswordConfirm').val();
            if (!password || password ===''){
                alert("请检查您的输入");
                return false;
            }
            console.log("Reset password 1");
            if ( areValidPasswords(password, passwordConfirm)) {
                console.log("Reset password 2");
                Accounts.resetPassword(Session.get('resetPassword'), password, function (err) {
                    if (err) {
                        console.log('We are sorry but something went wrong.');
                        alert("未能成功重置密码，请稍后重试或从手机端再次发起重置请求");
                    } else {
                        console.log('Your password has been changed. Welcome back!');
                        alert("密码重置已成功，请从应用登陆");
                        Session.set('resetPassword', null);
                    }
                });
            }
            return false;
        }
    });
}