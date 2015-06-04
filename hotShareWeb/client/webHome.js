Template.webHome.rendered = function() {
    $('.webHome').css('height', $(window).height());
    $('.webFooter').css('left', $(window).width()*0.5-105);
  };
Template.webHome.events({
    'click .iosBtn':function(){
      var userAgent = navigator.userAgent.toLowerCase();
      if(userAgent.indexOf('micromessenger')>=0){
//        document.write('微信内无法下载，请点击“右上角”按钮，选择“在浏览器中打开”即可正常下载');
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere';
      }
    }
});

Template.webHome.helpers({
    resetPassword: function(){
        return Session.get('resetPassword');
    }
});

Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });