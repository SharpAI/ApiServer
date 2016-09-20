import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './login.html';
import '../../api/public.js';
import '../../api/login.js';


Template.login.events({
  'click #sub-login': function (e, t) {
    if (Meteor.status().connected !== true) {
      PUB.toast('当前为离线状态,请检查网络连接');
      return;
    }
    var username = t.find('#login-tel').value;
    var pwd = t.find('#login-code').value;
    console.log('username',username);
    if (username === '') {
      console.log('no username');
      PUB.toast('请输入用户名！');
    } else if (pwd === '') {
      console.log('no password');
      PUB.toast('请输入密码！');
    } else {
      console.log('login in');
      onlogin(username, pwd);
    }
    return false;
  }
});