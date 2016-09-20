import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';

import '../../ui/pages/login.js';
import '../../ui/pages/home.js';
import '../../ui/pages/noAuth.js';

// import '../../api/get_msg_code.js';

Router.route('/', function () {
  this.render('login');
});

Router.route('/home', function () {
  this.render('home');
});

Router.route('/noAuth', function () {
  this.render('noAuth');
});