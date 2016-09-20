import './home.html';

Template.home.onCreated(function () {
  if (Meteor.user() == null) {
    Router.go('/');
    toastr.warning('当前为离线状态,请检查网络连接');
  }
});