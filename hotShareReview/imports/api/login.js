import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';

this.onlogin = function(username, code) {
  console.log("login user ");
  Meteor.loginWithPassword(username, code, function(error) {
    if(error){
      console.log('login error ' + error);
      PUB.toast('登陆失败！用户或密码错误');
    } else {
      console.log("login Success!");
      if(Meteor.user().profile && Meteor.user().profile.reporterSystemAuth){
        Router.go('/home');
      }else{
        Router.go('/noAuth');
      }
    }
  })
}