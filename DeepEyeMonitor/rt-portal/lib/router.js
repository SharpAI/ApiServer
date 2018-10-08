/*HomeController = RouteController.extend({
  onBeforeAction: function () {
    this.redirect('/dashboard/overview');
  }
});*/
//import parser from 'ua-parser-js';
//import url from 'url';

LoginController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  },
  onAfterAction: function(){
    
  }
});

OverviewController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  }
});

ReportsController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  }
});
Router.onBeforeAction(function() {
  if (! Meteor.userId()) {
    Router.go('/')
    this.next();
  } else {
    this.next();
  }
});
Router.route('home', {
  path: '/'
});

Router.route('dashboard', {
  path: '/dashboard'
});
Router.route('signup', {
  path: '/signup'
});
Router.route('overview', {
  layoutTemplate: 'dashboard',
  path: '/dashboard/overview',
  waitOn: function() {
    Session.set('currentPage','realtime')
  }
});

Router.route('history', {
  layoutTemplate: 'dashboard',
  path: '/dashboard/history',
  waitOn: function() {
    Session.set('currentPage','history')
  },
  action: function() {
    this.render('overview');
  }
});

Router.route('reports', {
  layoutTemplate: 'dashboard',
  path: '/dashboard/reports'
});

Router.route('login', {
  path: '/login'
});

Router.route('settings', {
  layoutTemplate: 'dashboard',
  path: '/dashboard/settings'
});

Router.route('box', {
  layoutTemplate: 'dashboard',
  path:'/dashboard/box',
  waitOn: function() {
    Session.set('currentPage','box');
  }
});
Router.route('boxMonitorsAlive', {
  layoutTemplate: 'dashboard',
  path:'/dashboard/box-monitors-alive',
  waitOn: function() {
    Session.set('currentPage','box-monitors-alive');
  }
});
Router.route('boxMonitorTraffic',{
  layoutTemplate: 'dashboard',
  path:'/dashboard/box-monitors/traffic',
  waitOn: function() {
    Session.set('currentPage','box-monitors-alive-traffic');
  }
})

Router.route('qoe', {
  layoutTemplate: 'dashboard',
  path:'/dashboard/qoe',
  waitOn: function() {
    Session.set('currentPage','qoe');
  }
});


//WebApp.connectHandlers.use("/ua", function(req,res,next){
//  res.setHeader("Access-Control-Allow-Origin","*");
//  res.writeHead(200);
//  var data = '?';
//  var query = {}
//  req.on('data',function(trunk){
//    data += trunk;
//    query = url.parse(data,true).query;
//    var ua = parser(req.headers['user-agent']);
//    ua.page = query;
//    ua.page.url = req.headers['origin'];
//    ua.ip = getClientIp(req);
//
//    // todo: save to db
//    console.log(JSON.stringify(ua,null,' '));
//  });
//  res.end('ok');
//});

